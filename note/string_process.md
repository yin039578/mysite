# String Processing

# specific string processing case
## mail & cellphone
### 換成星號
``` python
from typing import Match
from email_validator import validate_email, EmailNotValidError
import phonenumbers
from phonenumbers.phonenumberutil import NumberParseException

# ========== Email（ASCII）候選：log-safe 子集合 ==========
# 說明：
# - 為避免把 "sender=et.cs@..." 的 "sender=" 吃進 local-part，
#   我們在「候選擷取 regex」的 local-part 中 *排除 '='*。
# - 真正合法性仍交給 email-validator；若你的業務確實用到 '='，
#   再放寬此集合。
EMAIL_CANDIDATE_RE = re.compile(r"""
    (?<![A-Za-z0-9!#$%&'*+/?^_`{|}~.-])              # 左邊不是 username 允許字元（注意：不含 '='）
    (                                                # group 1: 整段 email（原樣）
      ([A-Za-z0-9!#$%&'*+/?^_`{|}~-]+               # group 2: local-part（dot-atom，排除 '='）
        (?:\.[A-Za-z0-9!#$%&'*+/?^_`{|}~-]+)*)
      @
      (                                              # group 3: domain
        (?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])\.)+
        [A-Za-z]{2,63}
      )
    )
""", re.VERBOSE)

# ========== 電話候選 ==========
# 1) 嚴格 E.164（無分隔）
E164_STRICT_RE = re.compile(r"""
    (?<!\d)
    (\+[1-9]\d{1,14})
    (?!\d)
""", re.VERBOSE)

# 2) 國際號碼（鬆綁擷取，允許空白 / '-' / '()' 分隔；如：+886-912-345-678、(+886)912 345 678）
INTL_LOOSE_RE = re.compile(r"""
    (?<!\d)
    (\+[1-9][\d\-\s()]{6,24})     # 粗略長度門檻；實際合法性交 phonenumbers 驗證
    (?!\d)
""", re.VERBOSE)

# 3) 台灣本地 09（允許空白 / '-' / '()'）
TW09_RE = re.compile(r"""
    (?<!\d)
    (0\s*9(?:[\s\-\(\)]*\d){8})
    (?!\d)
""", re.VERBOSE)


# -------------------- 遮蔽 callbacks --------------------

def _mask_email(m: Match[str]) -> str:
    whole, user, domain = m.group(1), m.group(2), m.group(3)
    try:
        validate_email(whole, allow_smtputf8=False, check_deliverability=False)  # 嚴格 ASCII
    except EmailNotValidError:
        return whole  # 驗證不通過 → 不遮蔽

    n = len(user)
    if n <= 2:
        masked_user = '*' * n
    elif n <= 4:
        masked_user = user[0] + '*' * (n - 1)
    elif n <= 6:
        masked_user = user[:2] + '*' * (n - 2)
    else:
        masked_user = user[:3] + '*' * (n - 3)
    return masked_user + '@' + domain  # 長度不變（只動 user）

def _mask_e164_digits_only(m: Match[str]) -> str:
    s = m.group(1)                       # e.g. +886912345678
    try:
        num = phonenumbers.parse(s, None)
        if not phonenumbers.is_valid_number(num):
            return s
    except Exception:
        return s

    plus, digits = s[0], s[1:]
    n = len(digits)
    if n <= 1:
        return s
    head_keep, tail_keep = (3, 2) if n >= 5 else (1, 1)
    mid_len = max(0, n - head_keep - tail_keep)
    return plus + digits[:head_keep] + ('*' * mid_len) + digits[-tail_keep:]

def _mask_intl_loose(m: Match[str]) -> str:
    """
    對 '+...' 且含分隔符的國際號碼：
    - 清洗出 E.164 字串，交 phonenumbers 驗證；
    - 遮蔽規則：前三後二（短號前一後一），只替換數字，分隔符原位保留，長度不變。
    """
    s = m.group(1)                       # 例：+886-912-345-678、(+886)912 345 678
    try:
        # 清洗成 E.164 純數字
        digits = ''.join(ch for ch in s if ch.isdigit())
        e164 = '+' + digits
        num = phonenumbers.parse(e164, None)
        if not phonenumbers.is_valid_number(num):
            return s
    except Exception:
        return s

    # 計算要保留/遮蔽的「數字索引」（不含 '+', 僅在數字上動手）
    n = len(digits)
    if n <= 1:
        return s
    head_keep, tail_keep = (3, 2) if n >= 5 else (1, 1)
    keep_heads = set(range(0, head_keep))
    keep_tails = set(range(n - tail_keep, n))
    # 建立原字串中的數字位置索引映射
    out, k = list(s), 0  # k: 遍歷 digits 的索引
    for i, ch in enumerate(out):
        if ch.isdigit():
            if (k not in keep_heads) and (k not in keep_tails):
                out[i] = '*'
            k += 1
    return ''.join(out)

def _mask_tw09(m: Match[str]) -> str:
    """
    台灣 09：先取 10 碼數字，以 'TW' 驗證；保留前4後3，只改動數字，分隔符原位保留。
    """
    s = m.group(1)
    try:
        digits = [c for c in s if c.isdigit()]
        if len(digits) != 10 or not (digits[0] == '0' and digits[1] == '9'):
            return s
        try:
            num = phonenumbers.parse(''.join(digits), 'TW')
            if not phonenumbers.is_valid_number(num):
                return s
        except NumberParseException:
            return s

        digit_pos = [i for i, c in enumerate(s) if c.isdigit()]  # 10 個索引
        keep_heads = set(digit_pos[:4])
        keep_tails = set(digit_pos[-3:])
        mask_targets = set(digit_pos) - keep_heads - keep_tails

        out = list(s)
        for i in mask_targets:
            out[i] = '*'
        return ''.join(out)
    except Exception:
        return s


# -------------------- 對外 API --------------------

def mask_sensitive_info(text: str) -> str:
    """
    去識別化：
      - Email：只動 local-part，長度不變；候選為 log-safe 子集合，最終由 email-validator 驗證。
      - Phone：支援
          1) 純 E.164（+XXXXXXXX…）
          2) 國際號碼含分隔符（+886-...、(+886) ...）
          3) 台灣本地 09（含分隔符）
        → 均以 phonenumbers 驗證通過才遮蔽；長度不變、分隔符保留。
    任一階段出錯 → 回傳原文（fail-safe）。
    """
    if ('@' not in text) and ('+' not in text) and ('09' not in text):
        return text
    try:
        out = EMAIL_CANDIDATE_RE.sub(_mask_email, text)
        out = E164_STRICT_RE.sub(_mask_e164_digits_only, out)
        out = INTL_LOOSE_RE.sub(_mask_intl_loose, out)  # 補捉含分隔的 +國碼
        out = TW09_RE.sub(_mask_tw09, out)
        return out
    except Exception:
        return text

```