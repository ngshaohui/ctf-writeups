---
title: "fd"
date: "2022-07-02"
site: https://pwnable.kr/
---

```bash
fd@pwnable:~$ cat fd.c
```

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
char buf[32];
int main(int argc, char* argv[], char* envp[]){
        if(argc<2){
                printf("pass argv[1] a number\n");
                return 0;
        }
        int fd = atoi( argv[1] ) - 0x1234;
        int len = 0;
        len = read(fd, buf, 32);
        if(!strcmp("LETMEWIN\n", buf)){
                printf("good job :)\n");
                system("/bin/cat flag");
                exit(0);
        }
        printf("learn about Linux file IO\n");
        return 0;

}
```

`read` function's first argument is the file descriptor

https://man7.org/linux/man-pages/man2/read.2.html

| value | name            |
| ----- | --------------- |
| 0     | standard input  |
| 1     | standard output |
| 2     | standard error  |

https://en.wikipedia.org/wiki/File_descriptor

`0x1234` is dec 4660

we need `argv[1]` to be 4660 so that 4660 - 0x1234 = 0

this allows us to pass the argument `LETMEWIN` from standard input

```bash
fd@pwnable:~$ ./fd 4660
LETMEWIN
good job :)
mommy! I think I know what a file descriptor is!!
```

flag

```
mommy! I think I know what a file descriptor is!!
```
