---
title: "collision"
date: "2022-07-02"
site: https://pwnable.kr/
---

```bash
col@pwnable:~$ cat col.c
```

```c
#include <stdio.h>
#include <string.h>
unsigned long hashcode = 0x21DD09EC;
unsigned long check_password(const char* p){
        int* ip = (int*)p;
        int i;
        int res=0;
        for(i=0; i<5; i++){
                res += ip[i];
        }
        return res;
}

int main(int argc, char* argv[]){
        if(argc<2){
                printf("usage : %s [passcode]\n", argv[0]);
                return 0;
        }
        if(strlen(argv[1]) != 20){
                printf("passcode length should be 20 bytes\n");
                return 0;
        }

        if(hashcode == check_password( argv[1] )){
                system("/bin/cat flag");
                return 0;
        }
        else
                printf("wrong passcode.\n");
        return 0;
}
```

we need `check_password(argv[1])` to return `0x21DD09EC`

```python
>>> 0x21DD09EC
568134124
```

```c
unsigned long check_password(const char* p){
        int* ip = (int*)p;
        int i;
        int res=0;
        for(i=0; i<5; i++){
                res += ip[i];
        }
        return res;
}
```

the i counter will loop 5 times

```c
int* ip = (int*)p;
```

since `p` is a `char*` pointer, `(int*)p`
this means that we are probably accessing 4 bytes at a time

for a string `"ABCD"` which is converted to an integer pointer, it gives the decimal value `1145258561`

```python
>>> hex(1145258561)
'0x44434241'
```

since we need to obtain `568134124` at the end

```python
>>> 568134124 / 5
113626824.8
>>> 568134124 % 5
4

>>> hex(113626824)
'0x6c5cec8'
>>> hex(113626828)
'0x6c5cecc'
```

we need a payload

```python
print("\xc8\xce\xc5\x06" * 4 + "\xcc\xce\xc5\x06")
```

```bash
col@pwnable:~$ ./col `python -c 'print("\xc8\xce\xc5\x06" * 4 + "\xcc\xce\xc5\x06")'`
daddy! I just managed to create a hash collision :)
```
