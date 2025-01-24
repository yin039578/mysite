fStr1 = '''Dear {salutation} {name},
Thank you for your letter. We are sorry that our {product} {verbed} in your {room}.
'''
print(fStr1.format(salutation='Mr.', name='Yin', product='toaster', verbed='exploded', room='kitchen'))
#print(fStr1.format('Mr.', 'Yin', 'toaster', 'exploded', 'kitchen'))

fStr2 = '''Dear {} {},
Thank you for your letter. We are sorry that our {} {} in your {}.
'''
print(fStr2.format('Mr.', 'Yin', 'toaster', 'exploded', 'kitchen'))

fStr3 = '''Dear %s %s,
Thank you for your letter. We are sorry that our %s %s in your %s.
'''
print(fStr3 % ('Mr.', 'Yin', 'toaster', 'exploded', 'kitchen'))

salutation = 'Mr.'
name = 'Yin'
product = 'toaster'
verbed = 'exploded'
room = 'kitchen'
fStr4 = f'''Dear {salutation} {name},
Thank you for your letter. We are sorry that our {product} {verbed} in your {room}.
'''
print(fStr4)