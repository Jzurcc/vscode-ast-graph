n = 4
result = 1

def factorial(num):
    if num <= 1:
        return 1
    
    return num * factorial(num - 1)

result = factorial(n)
print("Factorial of 4 is: ", end='')
print(result)
