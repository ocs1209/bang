#ifndef __RTVIEW_BLEPKT_H__
#define __RTVIEW_BLEPKT_H__

typedef unsigned char	UI08;
//typedef signed char		BOOL;

#define TRUE		1
#define FALSE		0

void X6PktCalcCheckSum(UI08* hBuff,UI08 nLen);
signed char X6PktVerify(UI08* hBuff,UI08 nLen);
unsigned int X6crc16_cal(const UI08*data, unsigned int length, unsigned int init_crc);
unsigned int X6checkcrc16_cal(const UI08*data, unsigned int length, unsigned int init_crc,UI08 f,UI08 s);
#endif
