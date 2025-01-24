guess_me = 5
for number in range(10):
    if number < guess_me:
        print('too low')
    elif number == guess_me:
        print('found it!')
    else:
        print('oops')
        break
# 沒有按照需求編寫，多印了oops
