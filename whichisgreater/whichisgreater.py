# ***Which is Greater? Solution***
# Difficulty: 1.2
# Time Limit: 1 second, Memory Limit: 2048 MB
# Acceptance: 50%
# CPU Time: 0.04 s
# Author: No author
# Source: 2021 ICPC North America Regionals (March 5 2022)
# Link: https://open.kattis.com/problems/whichisgreater


a, b = list(map(int, input().split()))
print("0") if a <= b else print("1")
