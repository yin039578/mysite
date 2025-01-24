import random
while True:
    secret = random.randint(1, 10)
    guess = random.randint(1, 10)
    if guess > secret:
        print('Too big')  
    elif guess < secret:
        print('Too Small')
    else:
        print('Just right')
        break;
    print('secret is {}, guess is {}'.format(secret, guess))