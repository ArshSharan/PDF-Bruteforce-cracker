from collections import defaultdict
import json

words = []
with open('passwords.txt', 'r', encoding='utf-8', errors='ignore') as f:
    words = [line.strip() for line in f.readlines()]  # Strip newlines

chars = defaultdict(lambda: defaultdict(int))

for i in words:
    for j in range(len(i)-1):
        chars[i[j]][i[j+1]] += 1
for i in chars:
    su = 0
    for j in chars[i]:
        su+=chars[i][j]

    for j in chars[i]:
        chars[i][j] = chars[i][j]/su;

with open("Weight.txt", 'w', encoding='utf-8') as f:
    f.write(json.dumps(chars, ensure_ascii=False))
