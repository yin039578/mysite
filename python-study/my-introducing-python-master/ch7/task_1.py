#7-1
print('7-1 ====================') 
year_list = list(range(1987, 1987+5))
print(year_list) 

#7-2 0歲不算生日！
print('7-2 ====================') 
print(year_list[3]) 

#7-3 
print('7-3 ====================') 
print(year_list[len(year_list) - 1]) 
print(year_list[-1]) 

#7-4
print('7-4 ====================') 
things = ['mozzarella', 'cinderella', 'salmonella']
print(things)

#7-5
print('7-5 ====================') 
for i in things:
    capitalize = i.capitalize()
    print(capitalize)
print(things)

#7-6 未按照題目要求
print('7-6 ====================') 
print(things[0].upper())
print(things)
#fix
things[0] = things[0].upper()
print(things)

#7-7
print('7-7 ====================') 
del things[2]
print(things)

#7-8
print('7-8 ====================') 
surprise = ['Groucho', 'Chico', 'Harpo']
print(surprise)

#7-9
print('7-9 ====================') 
print(surprise[-1].lower()[::-1].capitalize())
# surprise[-1] = surprise[::-1].capitalize()

#7-10
print('7-10 ====================') 
evan = [num for num in range(10) if num % 2 == 0]
print(evan)
evan2 = list(range(10))[::2]
print(evan2)

#7-11
print('7-11 ====================') 
start1 = ['fee', 'fie', 'foe']
ryhme = [
    ('flop', 'get a mop'),
    ('fope', 'turn the rope'),
    ('fa', 'get your ma'),
    ('fudge', 'call the judge'),
    ('fat', 'pet the cat'),
    ('fog', 'walk the dog'),
    ('fun', "say we're done"),
]
start2 = 'Someone better'
for first, second in ryhme:
    line1 = ' '.join([f'{str1.capitalize()}!' for str1 in start1]) + f' {first.capitalize()}!'
    print(line1)
    line2 = f'{start2} {second}.'
    print(line2)
    


