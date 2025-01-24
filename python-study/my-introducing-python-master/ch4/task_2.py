from random import randint

pool = ['cherry','pea','watermelon','pumpkin','QQ']
pick = pool[randint(0, len(pool)-1)]
if pick == 'cherry':
    small = True
    green = False
elif pick == 'pea':
    small = True
    green = True
elif pick == 'watermelon':
    small = False
    green = True
elif pick == 'pumpkin':
    small = False
    green = False
else:
    small = None
    green = None

print('pick {}, small is {}, green is {}'.format(pick, small, green))