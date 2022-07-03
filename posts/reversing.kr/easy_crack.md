---
title: "Easy_CrackMe"
date: "2022-07-02"
site: https://reversing.kr/
---

```
>file Easy_CrackMe.exe
Easy_CrackMe.exe: PE32 executable (GUI) Intel 80386, for MS Windows
```

```
>strings Easy_CrackMe.exe
!This program cannot be run in DOS mode.
URich
.text
`.rdata

...

GetStringTypeW
KERNEL32.dll
Incorrect Password
Congratulation !!
EasyCrackMe
AGR3versing
```

when loading into ghidra, it fails to identify main

however cutter is able to identify and label main, giving a good starting point

```
int main (int argc, char **argv, char **envp);
; arg char **hInstance @ esp+0x18
0x00401000      mov     eax, dword [hInstance] ; [00] -r-x section size 16384 named .text
0x00401004      push    0          ; LPARAM dwInitParam
0x00401006      push    0x401020   ; DLGPROC lpDialogFunc
0x0040100b      push    0          ; HWND hWndParent
0x0040100d      push    0x65       ; 'e' ; 101 ; LPCSTR lpTemplateName
0x0040100f      push    eax        ; HINSTANCE hInstance
0x00401010      call    dword [DialogBoxParamA] ; 0x4050a8 ; INT_PTR DialogBoxParamA(HINSTANCE hInstance, LPCSTR lpTemplateName, HWND hWndParent, DLGPROC lpDialogFunc, LPARAM dwInitParam)
0x00401016      xor     eax, eax
0x00401018      ret     0x10
0x0040101b      nop
0x0040101c      nop
0x0040101d      nop
0x0040101e      nop
0x0040101f      nop
0x00401020      cmp     dword [esp + 8], 0x111
0x00401028      je      0x40102f
0x0040102a      xor     eax, eax
0x0040102c      ret     0x10
0x0040102f      mov     eax, dword [esp + 0xc]
0x00401033      and     eax, 0xffff
0x00401038      sub     eax, 2
0x0040103b      je      0x40105e
0x0040103d      sub     eax, 0x3e7 ; 999
0x00401042      je      0x401049
0x00401044      xor     eax, eax
0x00401046      ret     0x10
0x00401049      mov     eax, dword [esp + 4]
0x0040104d      push    eax
0x0040104e      call    fcn.00401080
0x00401053      add     esp, 4
0x00401056      mov     eax, 1
0x0040105b      ret     0x10
0x0040105e      mov     ecx, dword [esp + 4]
0x00401062      push    2          ; 2
0x00401064      push    ecx
0x00401065      call    dword [EndDialog] ; 0x4050a4 ; BOOL EndDialog(HWND hDlg, INT_PTR nResult)
0x0040106b      mov     eax, 1
0x00401070      ret     0x10
0x00401073      nop
0x00401074      nop
0x00401075      nop
0x00401076      nop
0x00401077      nop
0x00401078      nop
0x00401079      nop
0x0040107a      nop
0x0040107b      nop
0x0040107c      nop
0x0040107d      nop
0x0040107e      nop
0x0040107f      nop
```

need to look at `fcn.00401080` for more information

```c
void __cdecl FUN_00401080(HWND param_1)

{
  byte bVar1;
  byte *pbVar2;
  int iVar3;
  char *pcVar4;
  undefined4 *puVar5;
  bool bVar6;
  char local_64;
  char local_63;
  char local_62;
  byte abStack97 [97];
  
  local_64 = '\0';
  puVar5 = (undefined4 *)&local_63;
  for (iVar3 = 0x18; iVar3 != 0; iVar3 = iVar3 + -1) {
    *puVar5 = 0;
    puVar5 = puVar5 + 1;
  }
  *(undefined2 *)puVar5 = 0;
  *(undefined *)((int)puVar5 + 2) = 0;
  GetDlgItemTextA(param_1,1000,&local_64,100);
  if (local_63 == 'a') {
    iVar3 = _strncmp(&local_63 + 1,&DAT_00406078,2);
    if (iVar3 == 0) {
      pcVar4 = s_AGR3versing_0040606a;
      pbVar2 = (byte *)(&local_63 + 3);
      do {
        pcVar4 = (char *)((byte *)pcVar4 + 2);
        bVar1 = *pbVar2;
        bVar6 = bVar1 < (byte)*pcVar4;
        if (bVar1 != *pcVar4) {
LAB_00401102:
          iVar3 = (1 - (uint)bVar6) - (uint)(bVar6 != 0);
          goto LAB_00401107;
        }
        if (bVar1 == 0) break;
        bVar1 = pbVar2[1];
        bVar6 = bVar1 < ((byte *)pcVar4)[1];
        if (bVar1 != ((byte *)pcVar4)[1]) goto LAB_00401102;
        pbVar2 = pbVar2 + 2;
      } while (bVar1 != 0);
      iVar3 = 0;
LAB_00401107:
      if ((iVar3 == 0) && (local_64 == 'E')) {
        MessageBoxA(param_1,s_Congratulation_!!_00406044,s_EasyCrackMe_00406058,0x40);
        EndDialog(param_1,0);
        return;
      }
    }
  }
  MessageBoxA(param_1,s_Incorrect_Password_00406030,s_EasyCrackMe_00406058,0x10);
  return;
}
```

```c
GetDlgItemTextA(param_1,1000,&local_64,100);
```

https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getdlgitemtexta

The documentation for `GetDlgItemTextA` shows that the 3rd param is the buffer and the 4th is the length

from the variable declaration

```c
char local_64;
char local_63;
char local_62;
byte abStack97 [97];
```

since they are sequential, they are actually all part of a 100 length char array

the first branch

```c
if (local_63 == 'a')
```

will be referencing `arr[1]` since it references the 2nd character

this means that the flag will be something like _a______

```c
iVar3 = _strncmp(&local_63 + 1,&DAT_00406078,2);
```

at `DAT_00406078` we can use ghidra to see that it contains the characters `5y`
since the `_strncmp` has an argument of 2 it is checking for those 2 characters

the flag will be _a5y____

```c
if ((iVar3 == 0) && (local_64 == 'E'))
```

the last predicate shows that the first character should be E so the flag will be Ea5y____

```c
pcVar4 = s_AGR3versing_0040606a;
```

`s_AGR3versing_0040606a` contains the constant string `AGR3versing`

```c
pcVar4 = (char *)((byte *)pcVar4 + 2);
```

in the `do` loop, we start referencing with an offset of +2, suggesting that the remainder of the flag is R3versing

this gives us the flag

`Ea5yR3versing`
