/*
 * Copyright (C) 2013 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.uracle.wellness.firmupgrade;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.UUID;

import com.smartband.DevDecode_X6;
import com.smartband.DevOperation_X6;
import com.uracle.wellness.R;

import android.app.Service;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.util.Log;
import m.client.library.plugin.fit.FitConstants;
/**
 * Service for managing connection and data communication with a GATT server
 * hosted on a given Bluetooth LE device.
 */
public class BluetoothLeService extends Service {
	private final static String TAG = BluetoothLeService.class.getSimpleName();

	public static DevOperation_X6 devOperation;
	public static DevDecode_X6 devDecode;

	public static int devOpCode = 0;
	public static int personalInfo_Type = 0;
	public static boolean isUsingPower = false;// �ĵ�ģʽ

	public int historyDate_Data_ID = 0;
	public int historyDetail_Data_ID = 0;

	public int historyDetail_Data_Block_ID = 1;// 1~7
	public int historyDetail_Data_Block_Hour_ID = 0;// 0~23

	public byte[] historyDate_Data = new byte[40];
	public byte[] historyDetail_Data = new byte[67];
	public int[][] historyDate_Map;
	public boolean isSetResetDevNotification = false;

	public int setNotification_ID = 0;
	public boolean isSetNotification_OK = false;

	// private UUID airUpgrade_UUID =
	// UUID.fromString("0000f018-0000-1000-8000-00805f9b34fb");
	private UUID uUID_Notify = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

	// private UUID uUID_Service_Main =
	// UUID.fromString("00001530-1212-efde-1523-785feabcd123");
	//
	// private UUID uUID_Cha_Operation =
	// UUID.fromString("00001531-1212-efde-1523-785feabcd123");
	// private UUID uUID_Cha_AirUpgrade_Img =
	// UUID.fromString("00001532-1212-efde-1523-785feabcd123");

	// ��������
	private UUID uUID_Service_Main = UUID.fromString("0000fff0-0000-1000-8000-00805f9b34fb");

	private UUID uUID_Cha_Operation = UUID.fromString("0000fff1-0000-1000-8000-00805f9b34fb");
	private UUID uUID_Cha_AirUpgrade_Img = UUID.fromString("0000fff2-0000-1000-8000-00805f9b34fb");

	private UUID uUID_Cha_Crc_CHARACTERISTIC_CONFIG = new UUID(45088566677504L, -9223371485494954757L);

	private BluetoothGattService service_Main, service_Reset;
	private BluetoothGattCharacteristic cha_Operation_AirUpgrade, cha_Write_Image_AirUpgrade, cha_ResetDev;

	// ͨ��
	private UUID uUID_Service_Dev_Info = UUID.fromString("0000180a-0000-1000-8000-00805f9b34fb");
	private UUID uUID_Service_Dev_Info_Battery = UUID.fromString("0000180f-0000-1000-8000-00805f9b34fb");

	private UUID uUID_Cha_Dev_Info_Battery = UUID.fromString("00002a19-0000-1000-8000-00805f9b34fb");
	private UUID uUID_Cha_Dev_Info_ModelType = UUID.fromString("00002a24-0000-1000-8000-00805f9b34fb");
	private UUID uUID_Cha_Dev_Info_Fireware = UUID.fromString("00002a26-0000-1000-8000-00805f9b34fb");
	private UUID uUID_Cha_Dev_Info_Hardware = UUID.fromString("00002a27-0000-1000-8000-00805f9b34fb");
	private UUID uUID_Cha_Dev_Info_Software = UUID.fromString("00002a28-0000-1000-8000-00805f9b34fb");
	private UUID uUID_Cha_Dev_Info_Manufacturer = UUID.fromString("00002a29-0000-1000-8000-00805f9b34fb");

	private BluetoothGattService service_Dev_Info, service_Dev_Info_Battery;
	private BluetoothGattCharacteristic cha_Info_Fireware, cha_Info_Hardware, cha_Info_Software, cha_Info_Manufacturer, cha_Info_Battery, cha_Info_ModelType;

	// �Զ���
	private UUID uUID_Service_Dev_Operiation = UUID.fromString("0000ffe0-0000-1000-8000-00805f9b34fb");

	private UUID uUID_Cha_Operiation_Read = UUID.fromString("0000ffe1-0000-1000-8000-00805f9b34fb");
	private UUID uUID_Cha_Operiation_NotificationData = UUID.fromString("0000ffe2-0000-1000-8000-00805f9b34fb");
	private UUID uUID_Cha_Operiation_Write = UUID.fromString("0000ffe4-0000-1000-8000-00805f9b34fb");

	private BluetoothGattService service_Dev_Operiation;
	private BluetoothGattCharacteristic cha_Operiation_Read, cha_Operiation_NotificationData, cha_Operiation_Write;

	// ��ʱ��Ϣ
	private UUID uUID_Service_Dev_Operiation_Current = UUID.fromString("0000ffe5-0000-1000-8000-00805f9b34fb");
	private UUID uUID_Cha_Operiation_Read_Current = UUID.fromString("0000ffe9-0000-1000-8000-00805f9b34fb");

	private BluetoothGattService service_Dev_Operiation_Current;
	private BluetoothGattCharacteristic cha_Operiation_Read_Current;

	// ����������̬����
	public static boolean dfu_IsDFUReset = false;// �ֻ��ѽ����������ģʽ����Ҫ����
	// public static boolean isWriteImageSize = false;// �Ƿ���д���ļ���С
	// public static boolean isWriteCRC_Version = false;// �Ƿ���д��CRC

	public static boolean dfu_IsSteadyUpgrade = false;// �Ƿ��ȶ�����
	public static boolean dfu_IsFastUpdate = false;// �Ƿ��������ģʽ

	public static boolean dfu_IsFirstDiscovery = false;// ��һ����������

	public static boolean dfu_IsStartUpgrade = false;// �Ƿ���ʽ����

	public static boolean dfu_IsReSend = false;// �Ͽ��ٴη���
	public static int dfu_IsReSendCount = 0;// ���·��ͼ�¼

	public static int dfu_FastCount = 200;// ��������һ�η������ݰ�����
	public static Integer dfu_AirUpgradeCount = 0;// ��ǰд��ڼ�����
	public static int dfu_ReceiveCount = 0;

	public static int dfu_PackageCount = -1;// ������������������ͷ�ļ���
	public static int dfu_LastPackageLength = -1;
	public static int dfu_HistoryDataCount = 0;
	public static byte[][] dfu_xval;// ���������飨������ͷ�ļ���
	public static byte[] dfu_xval_Last;// ���������飨������ͷ�ļ���

	public byte[] dfu_File_Data;// ԭʼ����

	String devTypeString = "X6";
	int devType = 0;// Ĭ��0 x6,1 x6c,2 x6s

	byte[] fileNameDescription = new byte[32];
	byte[] fileCreateTime = new byte[8];
	byte[] version = new byte[4];
	byte[] imgageSize = new byte[4];
	byte[] crc = new byte[4];
	byte[] crc_version = new byte[8];

	private BluetoothManager mBluetoothManager;
	private BluetoothAdapter mBluetoothAdapter;
	private String mBluetoothDeviceAddress;
	private BluetoothGatt mBluetoothGatt;
	private int mConnectionState = STATE_DISCONNECTED;

	private static final int STATE_DISCONNECTED = 0;
	private static final int STATE_CONNECTING = 1;
	private static final int STATE_CONNECTED = 2;

	public final static String ACTION_GATT_CONNECTED = "com.uracle.wellness.firmupgrade.ACTION_GATT_CONNECTED";
	public final static String ACTION_GATT_DISCONNECTED = "com.uracle.wellness.firmupgrade.ACTION_GATT_DISCONNECTED";
	public final static String ACTION_GATT_SERVICES_DISCOVERED = "com.uracle.wellness.firmupgrade.ACTION_GATT_SERVICES_DISCOVERED";
	public final static String ACTION_DATA_AVAILABLE = "com.uracle.wellness.firmupgrade.ACTION_DATA_AVAILABLE";
	public final static String EXTRA_DATA = "com.uracle.wellness.firmupgrade.EXTRA_DATA";

	public final static UUID UUID_HEART_RATE_MEASUREMENT = UUID.fromString(SampleGattAttributes.HEART_RATE_MEASUREMENT);

	// -----
	public final static String READ_DEV_Version = "com.uracle.wellness.firmupgrade.READ_DEV_Version";
	public final static String READ_DEV_Mac_Serial = "com.uracle.wellness.firmupgrade.READ_DEV_Mac_Serial";
	public final static String READ_DEV_Battery = "com.uracle.wellness.firmupgrade.READ_DEV_Battery";
	public final static String READ_DEV_CurrentDate = "com.uracle.wellness.firmupgrade.READ_DEV_CurrentDate";
	public final static String READ_DEV_CurrentSportData = "com.uracle.wellness.firmupgrade.CurrentSportData";
	public final static String READ_DEV_AlarmClock = "com.uracle.wellness.firmupgrade.AlarmClock";

	public final static String READ_DEV_PersonalInfo = "com.uracle.wellness.firmupgrade.PersonalInfo";
	public final static String READ_DEV_HistoryData = "com.uracle.wellness.firmupgrade.READ_DEV_HistoryData";

	public final static String READ_DEV_OPERATION = "com.uracle.wellness.firmupgrade.READ_DEV_OPERATION";

	public android.os.Handler activityHandler;

	private String tip_Steps, tip_Distances, tip_Calories;

	// writeStatus_op 0��ʼֵ��1д�룬2д�����
	private int writeStatus_op1 = 0;
	private int writeStatus_op8 = 0;
	private int writeStatus_opSize = 0;

	private int writeStatus_op2 = 0;
	private int writeStatus_opCRC = 0;
	private int writeStatus_op3 = 0;
	private int writeStatus_op4 = 0;

	public void setHandler(android.os.Handler h) {
		activityHandler = h;

		tip_Steps = getResources().getString(R.string.tips_steps);
		tip_Distances = getResources().getString(R.string.tips_distances);
		tip_Calories = getResources().getString(R.string.tips_calories);

	}

	// Implements callback methods for GATT events that the app cares about. For
	// example,
	// connection change and services discovered.
	private final BluetoothGattCallback mGattCallback = new BluetoothGattCallback() {
		@Override
		public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
			String intentAction;
			if (newState == BluetoothProfile.STATE_CONNECTED) {

				intentAction = ACTION_GATT_CONNECTED;
				mConnectionState = STATE_CONNECTED;
				broadcastUpdate(intentAction);
				Log.i("dklog", "Connected to GATT server.");
				// Attempts to discover services after successful connection.
				Log.i("dklog", "Attempting to start service discovery:" + mBluetoothGatt.discoverServices());
				if (dfu_IsDFUReset) {
					dfu_IsDFUReset = false;
					activityHandler.obtainMessage(2).sendToTarget();
				}

			} else if (newState == BluetoothProfile.STATE_DISCONNECTED) {

				intentAction = ACTION_GATT_DISCONNECTED;
				mConnectionState = STATE_DISCONNECTED;
				Log.i(TAG, "Disconnected from GATT server.");
				broadcastUpdate(intentAction);
				if (dfu_IsStartUpgrade) {// �Ͽ����ӣ��ٴ����ϣ�������������У�����д�뾵���ļ�
//					activityHandler.obtainMessage(0, "�豸�Ͽ���������ͣ�����Ӽ�������").sendToTarget();
//					activityHandler.obtainMessage(FitConstants.MSG_INITUUID_READY, "").sendToTarget();
				}
				if (dfu_IsDFUReset) {

					close();
					initialize();
					connect(mBluetoothDeviceAddress);
				}
			}
		}

		@Override
		public void onReadRemoteRssi(BluetoothGatt gatt, int rssi, int status) {
			// TODO Auto-generated method stub
			super.onReadRemoteRssi(gatt, rssi, status);
			System.out.println("Rssi=" + rssi);
		}

		@Override
		public void onDescriptorRead(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
			// TODO Auto-generated method stub
			super.onDescriptorRead(gatt, descriptor, status);
			String uuid = descriptor.getUuid().toString();
			System.out.println("onDescriptorRead-uuid=" + uuid);

			byte[] data = descriptor.getValue();

			System.out.println("onDescriptorRead-" + byteToString(data));
		}

		@Override
		public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
			// ֪ͨ���Է��أ�
			super.onDescriptorWrite(gatt, descriptor, status);

			String uuid = descriptor.getCharacteristic().getUuid().toString();
			byte[] data = descriptor.getValue();

			// System.out.println("onDescriptorWrite-uuid=" + uuid);
			// System.out.println("onDescriptorWrite-status=" + status);
			// System.out.println("onDescriptorWrite-" + byteToString(data));

			if (status == BluetoothGatt.GATT_SUCCESS) {// ����Notify�ɹ�
				if (uuid.equals(uUID_Cha_Operation.toString())) {// ����������
					System.out.println("д���������01");
					activityHandler.obtainMessage(0, "д���������01").sendToTarget();
					writeStatus_op1 = 1;
					writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 0x01 });// control
				}

			} else {// ʧ��

			}

			if (isSetResetDevNotification) {
				isSetResetDevNotification = false;
				byte[] data1 = switchAddr(mBluetoothDeviceAddress, true);

				// System.out.println("��λ");
				writeCharacteristic(cha_ResetDev, data1);// �豸��λxx
			}
			System.out.println("setNotification_ID=" + setNotification_ID);

			switch (setNotification_ID) {
			case 0:
				activityHandler.obtainMessage(FitConstants.MSG_INITUUID_READY, "").sendToTarget();
				break;
			
			case 1:
				if (cha_Operiation_Read != null) {
					setNotification_ID = 2;
					setCharacteristicNotification(cha_Operiation_Read, true);
				}
				break;
			case 2:
				setNotification_ID = 0;
				String intentAction = READ_DEV_OPERATION;
				broadcastUpdate(intentAction);
				setCharacteristicNotification(cha_Info_Battery, true);// �����Զ���ʾ

				break;
			case 3:
				setNotification_ID = 0;
				isSetNotification_OK = true;

				break;
			default:
				break;
			}
		}

		@Override
		public void onReliableWriteCompleted(BluetoothGatt gatt, int status) {
			// TODO Auto-generated method stub
			super.onReliableWriteCompleted(gatt, status);

			System.out.println("onReliableWriteCompleted-uuid=" + status);

		}

		@Override
		public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
			// TODO Auto-generated method stub
			super.onCharacteristicWrite(gatt, characteristic, status);

			String uuid = characteristic.getUuid().toString();
			// byte[] data = characteristic.getValue();// ��ȡ��������
			// System.out.println("д�뷵��-uid=" + uuid);
			// System.out.println("д�뷵��-״̬=" + status);
			// System.out.println("д�뷵��-data=" + byteToString(data));
			// System.out.println("д������״̬=" +
			// byteToString(characteristic.getValue()));

			if (uuid.equals(uUID_Cha_AirUpgrade_Img.toString())) {// �������ݷ���
				if (status == BluetoothGatt.GATT_SUCCESS) {// д��ɹ���д����һ������

					if (writeStatus_opSize == 1) {// ����ImageSizeд��ɹ�
						writeStatus_opSize = 2;
						return;
					}

					if (!dfu_IsSteadyUpgrade) {// �ȶ�������ʽ���߸÷���
						if (dfu_IsStartUpgrade) {// д�뾵���ļ�
							dfu_AirUpgradeCount++;
							activityHandler.obtainMessage(12, dfu_AirUpgradeCount).sendToTarget();
							if (dfu_AirUpgradeCount < (dfu_PackageCount - 1)) {// û��д��̼�
								System.out.println("write image count=" + dfu_AirUpgradeCount);
								writeCharacteristic(cha_Write_Image_AirUpgrade, dfu_xval[dfu_AirUpgradeCount]);
							} else if (dfu_AirUpgradeCount == (dfu_PackageCount - 1)) {// ���һ�����ݰ�������
								System.out.println("write image count=" + dfu_AirUpgradeCount);
								writeCharacteristic(cha_Write_Image_AirUpgrade, dfu_xval_Last);
							} else {
								System.out.println("write image completed");
								activityHandler.obtainMessage(0, "write image completed").sendToTarget();
								dfu_IsStartUpgrade = false;

							}
							return;
						}
					}
				} else {// д�뾵��ʧ�ܣ���д
					if (writeStatus_opSize == 1) {// ����ImageSizeд��ʧ����д
						System.out.println("��д-д���һ��ͷ�ļ�-�����С");

						writeStatus_opSize = 1;
						writeCharacteristic(cha_Write_Image_AirUpgrade, imgageSize);// image-size(4bytes)]
						return;
					}
					if (!dfu_IsSteadyUpgrade) {// �ȶ�������ʽ���߸÷���
						if (dfu_IsStartUpgrade) {// д�뾵���ļ�
							if (dfu_AirUpgradeCount < (dfu_PackageCount - 1)) {// û��д��̼�
								System.out.println("��д-write image count=" + dfu_AirUpgradeCount);
								writeCharacteristic(cha_Write_Image_AirUpgrade, dfu_xval[dfu_AirUpgradeCount]);
							} else if (dfu_AirUpgradeCount == (dfu_PackageCount - 1)) {// ���һ�����ݰ�������
								System.out.println(" ��д- write image count=" + dfu_AirUpgradeCount);
								writeCharacteristic(cha_Write_Image_AirUpgrade, dfu_xval_Last);
							} else {
								System.out.println("��д- write image completed");
								activityHandler.obtainMessage(0, "write image completed").sendToTarget();
								dfu_IsStartUpgrade = false;
							}
							return;
						}
					}
				}
			} else if (uuid.equals(uUID_Cha_Operation.toString())) {// ��������

				if (status == BluetoothGatt.GATT_SUCCESS) {// д��ɹ���д����һ������

					if (writeStatus_op1 == 1) {// ����01д��ɹ�
						writeStatus_op1 = 2;

						System.out.println("д���������08-��ѯ���ݰ�����");
						writeStatus_op8 = 1;
						if (dfu_IsSteadyUpgrade) {// �ȶ�����һ��д��һ�����ݰ�����Ӧ����д��һ��
							writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 8, (byte) 1, (byte) 0 });// control
						} else {// ��������
							writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 8, (byte) dfu_FastCount, (byte) 0 });// control
						}

					} else if (writeStatus_op8 == 1) {// ����08д��ɹ�
						writeStatus_op8 = 2;

						System.out.println("д���һ��ͷ�ļ�-�����С");

						writeStatus_opSize = 1;
						writeCharacteristic(cha_Write_Image_AirUpgrade, imgageSize);// image-size(4bytes)]

					} else if (writeStatus_op2 == 1) {// ����02д��ɹ�
						writeStatus_op2 = 2;

						System.out.println("д���2��ͷ�ļ�-crc_�汾");
						writeStatus_opCRC = 1;
						writeCharacteristic(cha_Write_Image_AirUpgrade, crc_version);

						writeOpcodeCheckCRC();
					} else if (writeStatus_opCRC == 1) {// д��CRC�ɹ�
						writeStatus_opCRC = 2;
					} else if (writeStatus_op3 == 1) {// д���������03
						dfu_IsStartUpgrade = true;
						dfu_AirUpgradeCount = 0;
						writeStatus_op3 = 2;
						System.out.println("д�뾵���ļ���=" + dfu_AirUpgradeCount);
						writeCharacteristic(cha_Write_Image_AirUpgrade, dfu_xval[dfu_AirUpgradeCount]);
						new Thread(checkWritefirmwareImgThread).start();// firstwaite��ִ�У���spaceִ��һ�Σ��û����
					} else if (writeStatus_op4 == 1) {// д���������04
						writeStatus_op4 = 2;
					}

				} else {

					if (writeStatus_op1 == 1) {// ����01д��ʧ����д
						System.out.println("��д --д���������01");
						activityHandler.obtainMessage(0, "��д --д���������01").sendToTarget();
						writeStatus_op1 = 1;
						writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 0x01 });// control
					} else if (writeStatus_op8 == 1) {// ����08д��ʧ����д
						System.out.println("��д --д���������08-��ѯ���ݰ�����");
						writeStatus_op8 = 1;
						if (dfu_IsSteadyUpgrade) {// �ȶ�����һ��д��һ�����ݰ�����Ӧ����д��һ��
							writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 8, (byte) 1, (byte) 0 });// control
						} else {// ��������
							writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 8, (byte) dfu_FastCount, (byte) 0 });// control
						}
					} else if (writeStatus_op2 == 1) {// ����02д��ʧ����д
						writeStatus_op2 = 1;
						System.out.println("��д --д���������02-initialize DFU Parameters");
						writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 2 });// control
					} else if (writeStatus_opCRC == 1) {// д��CRCʧ����д

						System.out.println("��д --д���2��ͷ�ļ�-crc_�汾");
						writeStatus_opCRC = 1;
						writeCharacteristic(cha_Write_Image_AirUpgrade, crc_version);
					} else if (writeStatus_op3 == 1) {// д���������03
						System.out.println("��д --д���������03-receive firmware image");
						activityHandler.obtainMessage(0, "д���������03").sendToTarget();
						writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 3 });// control
						writeStatus_op3 = 1;
					} else if (writeStatus_op4 == 1) {// д���������04
						writeStatus_op4 = 1;// ��ʼд������04
						writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { 4 });
					}

				}
			}

		}

		/**
		 * ֪ͨ���Ըı�
		 */
		@Override
		public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
			String uuid = characteristic.getUuid().toString();
			System.out.println("Notify-uuid=" + uuid);

			byte[] data = characteristic.getValue();

			System.out.println("Notify-" + byteToString(data));
			// activityHandler.obtainMessage(0, "Notify-" +
			// byteToString(data)).sendToTarget();

			// ��ʱ�����ϴ�
			if (uuid.equals(uUID_Cha_Operiation_Read_Current.toString())) {
				int currentStep = devDecode.decode_CurrentValue_Auto(data);
				// System.out.println("currentStep:" + currentStep);
				activityHandler.obtainMessage(0, tip_Steps + ":" + currentStep).sendToTarget();

			} else if (uuid.equals(uUID_Cha_Dev_Info_Battery.toString())) {// ���������ϴ�
				int value = data[0];
				// System.out.println("---------------���������ϱ�=" + value);
				activityHandler.obtainMessage(0, "����:" + value + "%").sendToTarget();
			} else if (uuid.equals(uUID_Cha_Operiation_Read.toString())) {

				System.out.println("opCode=" + devOpCode);
				switch (devOpCode) {
				case 1:
					String[] mac_sn = devDecode.decode_MAC_SN(data);
					if ((mac_sn != null) && (mac_sn.length == 2)) {
						activityHandler.obtainMessage(0, "MAC=" + mac_sn[0] + "  SN=" + mac_sn[1]).sendToTarget();
					}

					devOpCode = 0;
					break;
				case 2:
					int[] currentInfo = devDecode.decode_CurrentValue(data);
					if ((currentInfo != null) && (currentInfo.length == 3)) {
						activityHandler.obtainMessage(0, tip_Steps + ":" + currentInfo[0] + "  " + tip_Distances + ":" + currentInfo[1] + " " + tip_Calories + ":" + currentInfo[2]).sendToTarget();
					}
					devOpCode = 0;
					break;
				case 5:// ��ȡʱ��
					int[] date_Read = devDecode.decode_Date_Time(data);
					System.out.println("Device Time ��" + date_Read[0] + "-" + date_Read[1] + "-" + date_Read[2] + " " + date_Read[3] + ":" + date_Read[4]);
					activityHandler.obtainMessage(0, "Device Time:" + date_Read[0] + "-" + date_Read[1] + "-" + date_Read[2] + " " + date_Read[3] + ":" + date_Read[4]).sendToTarget();

					devOpCode = 0;
					break;
				case 6:// ��ȡ����
					int[] alarmClock_Read = devDecode.decode_AlarmClock(data);
					int[] enableData = DevDecode_X6.weekTransTo(alarmClock_Read[2]);
					System.out.println("AlarmClock  ID:" + alarmClock_Read[0] + " type:" + alarmClock_Read[1] + " enable:" + enableData[7] + " Time:" + alarmClock_Read[3] + ":" + alarmClock_Read[4] + " remindTime:" + alarmClock_Read[5]);
					activityHandler.obtainMessage(0, "AlarmClock ID:" + alarmClock_Read[0] + " type:" + alarmClock_Read[1] + " enable:" + enableData[0] + " (1~7):" + enableData[0] + enableData[1] + enableData[2] + enableData[3] + enableData[4] + enableData[5] + enableData[6] + " Time:" + alarmClock_Read[3] + ":" + alarmClock_Read[4] + " remindTime:" + alarmClock_Read[5]).sendToTarget();
					devOpCode = 0;
					break;
				case 7:// ��ȡ������Ϣ
					int[] persondata = devDecode.decode_PersonalInfo(data, personalInfo_Type);
					if (persondata == null) {
						devOpCode = 0;
						break;
					}
					if (personalInfo_Type == 1) {// 01 ������Ϣ�����/����/�Ա�/���䣩
						System.out.println("Person  Hight:" + persondata[0] + " Weight:" + persondata[1] + " Gender��" + persondata[2] + " Age:" + persondata[3]);
						activityHandler.obtainMessage(0, "Person  Hight:" + persondata[0] + " Weight:" + persondata[1] + " Gender��" + persondata[2] + " Age:" + persondata[3]).sendToTarget();

					} else if (personalInfo_Type == 2) { // 02 ��������
						System.out.println("Sedentary remind:" + persondata[0] + "S");
						activityHandler.obtainMessage(0, "Sedentary remind:" + persondata[0] + "S").sendToTarget();

					} else if (personalInfo_Type == 3) { // 03 Ŀ�경��
						System.out.println("Target Steps:" + persondata[0]);
						activityHandler.obtainMessage(0, "Target Steps:" + persondata[0]).sendToTarget();

					} else if (personalInfo_Type == 4) { // 04 ˯��ʱ��
						System.out.println("Read Sleepping Time=" + persondata[0] + ":" + persondata[1] + "~" + persondata[2] + ":" + persondata[3]);
						activityHandler.obtainMessage(0, "Read Sleepping Time=" + persondata[0] + ":" + persondata[1] + "~" + persondata[2] + ":" + persondata[3]).sendToTarget();

					} else if (personalInfo_Type == 5) { // 05 ��������
						System.out.println("Disconnect reminder=" + persondata[0] + "  Time format=" + persondata[1] + " �գ� Type��" + persondata[2]);
						activityHandler.obtainMessage(0, "Disconnect reminder=" + persondata[0] + "  Time format=" + persondata[1] + " �գ� Type��" + persondata[2]).sendToTarget();

					} else if (personalInfo_Type == 6) { // 06����ʱ��
						System.out.println("Do not disturb  enable=" + persondata[0] + " time��" + persondata[1] + ":" + persondata[2] + "~" + persondata[3] + ":" + persondata[4]);
						activityHandler.obtainMessage(0, "Do not disturb  enable=" + persondata[0] + " time��" + persondata[1] + ":" + persondata[2] + "~" + persondata[3] + ":" + persondata[4]).sendToTarget();
					} else if (personalInfo_Type == 7) { // 07 ���� ����ѡ��
						System.out.println("Language Code:" + persondata[0] + "\n 0 EN/CN/JP,1 Ko,2 Many languages,3 ISO8859");
						activityHandler.obtainMessage(0, "Language Code:" + persondata[0] + "\n 0 EN/CN/JP,1 Ko,2 Many languages,3 ISO8859").sendToTarget();
					} else if (personalInfo_Type == 8) { // 08 ��Ļˮƽ��ת
						System.out.println("Screen flip:" + persondata[0]);
						activityHandler.obtainMessage(0, "Screen flip:" + persondata[0]).sendToTarget();
					} else if (personalInfo_Type == 9) { // 09 ̧����������
						System.out.println(" Auto bright screen:" + persondata[0] + "\n0 Closed,2 Auto(Portrait),3 Auto(Horizontal)");
						activityHandler.obtainMessage(0, " Auto bright screen:" + persondata[0] + "\n0 Closed,1 Auto(Portrait),3 Auto(Horizontal)").sendToTarget();
					}else if (personalInfo_Type == 11) { // 0b ��ʱģʽ
						System.out.println(" Temporary mode:" + persondata[0] + "\n0 Open,1 Closed");
						activityHandler.obtainMessage(0, " Temporary mode:" + persondata[0] + "\n0 Open,2 Closed").sendToTarget();
					}
					devOpCode = 0;
					break;
				case 8:// д��ʱ��
					if (byteToString(data).replace(" ", "").equals("250121")) {
						activityHandler.obtainMessage(0, "Write time success").sendToTarget();
						System.out.println("Write time success");
					}
					devOpCode = 0;
					break;
				case 9:// д�������Ϣ
					if (byteToString(data).replace(" ", "").contains("250220")) {
						activityHandler.obtainMessage(0, "Write personal information successfully").sendToTarget();
						System.out.println("Write personal information successfully");
					}
					devOpCode = 0;
					break;
				case 10:// д������
					if (byteToString(data).replace(" ", "").contains("250222")) {
						activityHandler.obtainMessage(0, "Write alarm clock successfully").sendToTarget();
						System.out.println("Write alarm clock successfully");
					}
					devOpCode = 0;
					break;
				case 51:// ��ȡ��ʷ����ӳ���
					if (historyDate_Data_ID == 0) {

						if (data.length < 20) {// ���ڲ�ȫ��ֻ��1/2/3������
							historyDate_Data_ID = 0;// ����

							historyDate_Map = devDecode.decode_HistoryRecodeDate(data, data.length);
							StringBuffer showBuffer = new StringBuffer();
							for (int j = 0; j < historyDate_Map.length; j++) {
								showBuffer.append("\n" + historyDate_Map[j][0] + "Block  Date=" + historyDate_Map[j][1] + "/" + historyDate_Map[j][2] + "/" + historyDate_Map[j][3]);
							}
							activityHandler.obtainMessage(0, "HistoryData  DateMaping:" + showBuffer.toString()).sendToTarget();
							devOpCode = 0;
						} else {
							historyDate_Data_ID = 1;
							for (int i = 0; i < data.length; i++) {
								historyDate_Data[i] = data[i];
							}
						}

						break;
					} else if (historyDate_Data_ID == 1) {
						historyDate_Data_ID = 0;
						int datalength = 20 + data.length;

						for (int i = 20; i < datalength; i++) {
							historyDate_Data[i] = data[i - 20];
						}

						historyDate_Map = devDecode.decode_HistoryRecodeDate(historyDate_Data, datalength);
						StringBuffer showBuffer = new StringBuffer();
						for (int j = 0; j < historyDate_Map.length; j++) {
							showBuffer.append("\n" + historyDate_Map[j][0] + "Block  Date=" + historyDate_Map[j][1] + "/" + historyDate_Map[j][2] + "/" + historyDate_Map[j][3]);
						}
						activityHandler.obtainMessage(0, "HistoryData  DateMaping:" + showBuffer.toString()).sendToTarget();
						devOpCode = 0;
						break;
					}
					break;
				case 52:
					// System.out.println(historyDetail_Data_ID + " ���ݰ�");
					// activityHandler.obtainMessage(0, historyDetail_Data_ID +
					// " ���ݰ�").sendToTarget();
					if (historyDetail_Data_ID == 0) {
						activityHandler.obtainMessage(0, historyDetail_Data_Block_ID + "Block  " + historyDetail_Data_Block_Hour_ID + "Hour").sendToTarget();
						// System.out.println("--------------���飺" +
						// historyDetail_Data_Block_ID + " Сʱ=" +
						// historyDetail_Data_Block_Hour_ID);
						if (data.length < 15) {
							// ��Сʱ������
							System.out.println(historyDetail_Data_Block_Hour_ID + "Hour����No Data");
							activityHandler.obtainMessage(0, historyDetail_Data_Block_Hour_ID + "Hour����No Data").sendToTarget();

							historyDetail_Data_Block_Hour_ID++;
							if (historyDetail_Data_Block_Hour_ID == 24) {// Сʱ����
								historyDetail_Data_Block_Hour_ID = 0;
								if (historyDate_Map[historyDetail_Data_Block_ID - 1][0] != 0) {// �и�������
									historyDetail_Data_Block_ID++;
								}

							}
							if ((historyDetail_Data_Block_ID > 7) || (historyDate_Map[historyDetail_Data_Block_ID - 1][0] == 0)) {// 7���������
								activityHandler.obtainMessage(0, "Over").sendToTarget();
								System.out.println("-----------Over");
								devOpCode = 0;
								break;
							}
							devOperation.readHistoryRecodeDatail((byte) historyDetail_Data_Block_ID, (byte) historyDetail_Data_Block_Hour_ID);

							break;
						}

						historyDetail_Data_ID = 1;
						for (int i = 0; i < data.length; i++) {
							historyDetail_Data[i] = data[i];
						}
						break;
					} else if (historyDetail_Data_ID == 1) {
						historyDetail_Data_ID = 2;
						for (int i = 20; i < 20 + data.length; i++) {
							historyDetail_Data[i] = data[i - 20];
						}
						break;
					} else if (historyDetail_Data_ID == 2) {
						historyDetail_Data_ID = 3;
						for (int i = 40; i < 40 + data.length; i++) {
							historyDetail_Data[i] = data[i - 40];
						}
						break;
					} else if (historyDetail_Data_ID == 3) {
						historyDetail_Data_ID = 0;

						for (int i = 60; i < 60 + data.length; i++) {
							historyDetail_Data[i] = data[i - 60];
						}

						int[][] steps = devDecode.decode_HistoryRecodeDatail(historyDetail_Data);

						int[] steps_temp = new int[steps.length - 1];
						int[] distances = new int[steps.length - 1];
						int[] calories = new int[steps.length - 1];
						for (int i = 1; i < steps.length; i++) {
							steps_temp[i - 1] = steps[i][1];
							activityHandler.obtainMessage(0, (i * 2 - 1) + "~" + (i * 2) + "min data=" + steps[i][1] + "  type=" + steps[i][0]).sendToTarget();
						}
						distances = devDecode.getHistoryDistance(steps_temp, 170);
						calories = devDecode.getHistoryCalories(distances, 60);

						// opCode = 0;
						historyDetail_Data_Block_Hour_ID++;
						if (historyDetail_Data_Block_Hour_ID == 24) {// Сʱ����
							historyDetail_Data_Block_Hour_ID = 0;
							if (historyDate_Map[historyDetail_Data_Block_ID - 1][0] != 0) {// �и�������
								historyDetail_Data_Block_ID++;
							}
						}
						if ((historyDetail_Data_Block_ID > 7) || (historyDate_Map[historyDetail_Data_Block_ID - 1][0] == 0)) {
							System.out.println("-----------Over");
							devOpCode = 0;
							break;
						}
						devOperation.readHistoryRecodeDatail((byte) historyDetail_Data_Block_ID, (byte) historyDetail_Data_Block_Hour_ID);
						break;
					}

					break;
				case 500:// д����Ϣͷ֪ͨ����
					// ִ�У�����
					activityHandler.obtainMessage(3).sendToTarget();
					devOpCode = 0;
					break;
				default:
					break;
				}

			}

			String dataString = byteToString(data);

			if (uuid.equals(uUID_Cha_Operation.toString())) {// ���������

				if (dataString.substring(0, 2).contains("11")) {// �������ݰ���������

					if (dfu_IsSteadyUpgrade) {// �ȶ�����һ��д��һ�����ݰ�����Ӧ����д��һ��
						if (dfu_IsStartUpgrade) {// д�뾵���ļ�
							if (data.length > 4) {
								int count = devDecode.bytesToInt2_2Bytes(new byte[] { data[2], data[1] });
								count = count / 20;
								System.out.println("�����ݰ� count=" + count);
								synchronized (dfu_AirUpgradeCount) {// ����
									dfu_AirUpgradeCount = count;
								}
							}

							activityHandler.obtainMessage(12, dfu_AirUpgradeCount).sendToTarget();
							if (dfu_AirUpgradeCount < (dfu_PackageCount - 1)) {// û��д��̼�
								System.out.println("write image count=" + dfu_AirUpgradeCount);
								writeCharacteristic(cha_Write_Image_AirUpgrade, dfu_xval[dfu_AirUpgradeCount]);
							} else if (dfu_AirUpgradeCount == (dfu_PackageCount - 1)) {// ���һ�����ݰ�������
								System.out.println("write image count=" + dfu_AirUpgradeCount);
								writeCharacteristic(cha_Write_Image_AirUpgrade, dfu_xval_Last);
							} else {

								System.out.println("write image completed");
								activityHandler.obtainMessage(0, "write image completed").sendToTarget();
								dfu_IsStartUpgrade = false;
							}
							return;
						}
					}

					if (dfu_IsFastUpdate) {
						dfu_ReceiveCount++;
						// System.out.println("receiveCount=" + (receiveCount %
						// fastCount) + " " + airUpgradeCount + "/" +
						// packageCount);
						// Ŀǰ�����ø÷���д��
						if ((dfu_ReceiveCount % dfu_FastCount) == 0) {// ����Ҫ��
							for (int i = 0; (i < dfu_FastCount) && (dfu_AirUpgradeCount < dfu_PackageCount); i++) {// Ҫ��С�����һ�����ݰ�֮ǰ
								activityHandler.obtainMessage(12, dfu_AirUpgradeCount).sendToTarget();

								writeCharacteristic(cha_Write_Image_AirUpgrade, dfu_xval[dfu_AirUpgradeCount]);
								dfu_AirUpgradeCount++;
								dfu_IsReSendCount = dfu_AirUpgradeCount;
								if (dfu_AirUpgradeCount == (dfu_PackageCount - 1)) {// ���һ�����ݰ�����
									activityHandler.obtainMessage(12, dfu_AirUpgradeCount).sendToTarget();
									writeCharacteristic(cha_Write_Image_AirUpgrade, dfu_xval_Last);
									break;
								}
							}
						}
					}

				} else if (dataString.contains("10 01 ")) {// ��������01����

					if (dataString.contains("10 01 01 ")) {// �ɹ�
						System.out.println("д���������02-initialize DFU Parameters");
						activityHandler.obtainMessage(0, "д���������02").sendToTarget();
					} else {// ʧ��
						System.out.println("��д-д���������02-initialize DFU Parameters");
						activityHandler.obtainMessage(0, "��д-д���������02").sendToTarget();
					}

					writeStatus_op2 = 1;
					writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 2 });// control

					writeOpcodeCheck02();

				} else if (dataString.contains("10 02 ")) {// ����02����

					if (dataString.contains("10 02 01 ")) {// ��ȷ����
						System.out.println("д���������03-receive firmware image");
						activityHandler.obtainMessage(0, "д���������03").sendToTarget();
					} else {// ���ִ���
						System.out.println("������д-д���������03-receive firmware image");
						activityHandler.obtainMessage(0, "д���������03").sendToTarget();
					}

					writeStatus_opCRC = 2;// ��ʾCRCд��ɹ�
					writeStatus_op3 = 1;// ��ʼд������03
					writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 3 });// control

					writeOpcodeCheck03();

				} else if (dataString.contains("10 03 01 ")) {
					synchronized (dfu_AirUpgradeCount) {// ����
						dfu_Flag_Send_id = dfu_AirUpgradeCount + 1;// ��������
						dfu_IsStartUpgrade = false;
					}
					System.out.println("д���������04-vlidate firmware");
					activityHandler.obtainMessage(0, "д���������04-vlidate firmware").sendToTarget();
					activityHandler.postDelayed(new Runnable() {
						@Override
						public void run() {
							writeStatus_op4 = 1;// ��ʼд������04
							writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { 4 });
						}
					}, 1000);

				} else if (dataString.contains("10 04 01 ")) {
					System.out.println("д���������05-��λ");
					activityHandler.obtainMessage(0, "д���������05-��λ").sendToTarget();
					writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { 5 });
				} else if (dataString.contains("10 07 01 ")) {// �Ͽ���������ȡ�豸�Ѿ��������ݰ�����
					activityHandler.obtainMessage(0, "�ѽ������ݸ���=" + byteToString(data).substring(9)).sendToTarget();

					if (data.length == 7) {
						byte re0001 = data[6];
						byte re0010 = data[5];
						byte re0100 = data[4];
						byte re1000 = data[3];

						System.out.println("-------�ѽ������ݰ�=" + byteToString(new byte[] { re0001, re0010, re0100, re1000 }));

						int recount = toInt(new byte[] { re0001, re0010, re0100, re1000 }) / 20;
						activityHandler.obtainMessage(0, "�ѽ������ݰ�=" + recount + "    �ѷ������ݰ�=" + dfu_AirUpgradeCount).sendToTarget();
						System.out.println("�ѽ������ݰ�=" + recount + "    �ѷ������ݰ�=" + dfu_AirUpgradeCount);
						if ((recount == (dfu_AirUpgradeCount + 0)) || (recount == (dfu_AirUpgradeCount + 1))) {
							if (recount == (dfu_AirUpgradeCount + 1)) {
								dfu_AirUpgradeCount++;
							}
							activityHandler.postDelayed(new Runnable() {
								@Override
								public void run() {
									writeCharacteristic(cha_Write_Image_AirUpgrade, dfu_xval[dfu_AirUpgradeCount]);
								}
							}, 1000);
						} else {
							activityHandler.obtainMessage(0, "���ݰ������쳣������������").sendToTarget();
						}
					}

				}
			}
		}

		// ��byte����bRefArrתΪһ������,�ֽ�����ĵ�λ�����͵ĵ��ֽ�λ
		public int toInt(byte[] b) {
			int mask = 0xff;
			int temp = 0;
			int n = 0;
			for (int i = 0; i < 4; i++) {
				n <<= 8;
				temp = b[i] & mask;
				n |= temp;
			}
			return n;
		}

		@Override
		public void onServicesDiscovered(BluetoothGatt gatt, int status) {
			if (status == BluetoothGatt.GATT_SUCCESS) {
				broadcastUpdate(ACTION_GATT_SERVICES_DISCOVERED);
				if (dfu_IsStartUpgrade) {
					if (dfu_IsFirstDiscovery) {
						dfu_IsFirstDiscovery = false;

						dfu_IsReSend = true;
						initUpdate();
						activityHandler.postDelayed(new Runnable() {

							@Override
							public void run() {
								// TODO Auto-generated method stub
								activityHandler.obtainMessage(0, "���·��;����ļ�").sendToTarget();

								// //
								// ����֪ͨ,����UUID���Ըı�ʱ����֪ͨ����onCharacteristicChanged�н�������
								// setCharacteristicNotification(cha_Operation,
								// true);
								activityHandler.postDelayed(new Runnable() {

									@Override
									public void run() {
										// TODO Auto-generated method stub
										writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 7 });// control
									}
								}, 1000);

								// airUpgradeCount++;
								// writeCharacteristic(imagecha,
								// xval[airUpgradeCount]);
							}
						}, 500);
					}
				}

			} else {
				Log.w(TAG, "onServicesDiscovered received: " + status);
			}
		}

		private void writeOpcodeCheck02() {
			activityHandler.postDelayed(new Runnable() {
				@Override
				public void run() {
					// TODO Auto-generated method stub
					if (writeStatus_op2 != 2) {// δ���д��02����
						System.out.println("��ʱ���-д���������02-initialize DFU Parameters");
						activityHandler.obtainMessage(0, "��ʱ���-д���������02-initialize DFU Parameters").sendToTarget();

						writeStatus_op2 = 1;
						writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 2 });// control

						writeOpcodeCheck02();
					}
				}
			}, 2000);// һ��ʱ������Ƿ�д��ɹ�

		}

		private void writeOpcodeCheckCRC() {
			activityHandler.postDelayed(new Runnable() {
				@Override
				public void run() {
					// TODO Auto-generated method stub
					if (writeStatus_opCRC != 2) {// δ���д��02����

						writeOpcodeCheckCRC();
					}
				}
			}, 2000);// һ��ʱ������Ƿ�д��ɹ�

		}

		private void writeOpcodeCheck03() {
			activityHandler.postDelayed(new Runnable() {
				@Override
				public void run() {
					// TODO Auto-generated method stub
					if (writeStatus_op3 != 2) {// δ���д��03����
						System.out.println("��ʱ���-д���������03-receive firmware image");
						activityHandler.obtainMessage(0, "��ʱ���-д���������03").sendToTarget();

						writeStatus_op3 = 1;// ��ʼд������03
						writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 3 });// control

						writeOpcodeCheck03();
					}
				}
			}, 2000);// һ��ʱ������Ƿ�д��ɹ�
		}

		@Override
		public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {

			String uid = characteristic.getUuid().toString();
			byte[] data = characteristic.getValue();
			System.out.println("�յ�UUID��" + uid);
			System.out.println("�յ���" + byteToString(data));
			if (status == BluetoothGatt.GATT_SUCCESS) {// �ɹ���ȡ

				// System.out.println("У������" + VerifyData(data, data.length));

				if (uid == null) {// �ж��Ƿ�Ϊ��,��ͷ�Ƿ����
					return;
				}
				if (uid.equals(uUID_Cha_Dev_Info_Battery.toString())) {
					System.out.println("device battery=" + (int) data[0] + "%");
					activityHandler.obtainMessage(0, "device battery=" + (int) data[0] + "%").sendToTarget();
				} else if (uid.equals(uUID_Cha_Dev_Info_Fireware.toString())) {
					try {
						String srt2 = new String(data, "UTF-8");
						activityHandler.obtainMessage(0, "Firmware version=" + srt2).sendToTarget();
						System.out.println("Firmware version=" + srt2);
					} catch (UnsupportedEncodingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}

				} else if (uid.equals(uUID_Cha_Dev_Info_Software.toString())) {
					try {
						String srt2 = new String(data, "UTF-8");
						activityHandler.obtainMessage(0, "Soft version=" + srt2).sendToTarget();
						System.out.println("Soft version=" + srt2);
					} catch (UnsupportedEncodingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}

				} else if (uid.equals(uUID_Cha_Dev_Info_Hardware.toString())) {
					try {
						String srt2 = new String(data, "UTF-8");
						activityHandler.obtainMessage(0, "Hardware version=" + srt2).sendToTarget();
						System.out.println("Hardware version=" + srt2);
					} catch (UnsupportedEncodingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}

				} else if (uid.equals(uUID_Cha_Dev_Info_ModelType.toString())) {// �豸
					try {
						devTypeString = new String(data, "UTF-8");
//						activityHandler.obtainMessage(0, "ModelType=" + devTypeString).sendToTarget();
						System.out.println("ModelType=" + devTypeString);
						Log.d("dklog",">>>>> UUID ModelType = " + devTypeString);
						if (devTypeString.toLowerCase().contains("x6c")) {
							devType = 1;
						} else if (devTypeString.toLowerCase().contains("x6s")) {
							devType = 2;
							activityHandler.obtainMessage(15, "").sendToTarget();
						} 
						else { //dfu
							devType = 2;
						}

					} catch (UnsupportedEncodingException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}

				}

			} else {

			}
		}

	};

	private void broadcastUpdate(final String action) {
		final Intent intent = new Intent(action);
		sendBroadcast(intent);
	}

	private void broadcastUpdate(final String action, final BluetoothGattCharacteristic characteristic) {
		final Intent intent = new Intent(action);

		// This is special handling for the Heart Rate Measurement profile. Data
		// parsing is
		// carried out as per profile specifications:
		// http://developer.bluetooth.org/gatt/characteristics/Pages/CharacteristicViewer.aspx?u=org.bluetooth.characteristic.heart_rate_measurement.xml
		if (UUID_HEART_RATE_MEASUREMENT.equals(characteristic.getUuid())) {
			int flag = characteristic.getProperties();
			int format = -1;
			if ((flag & 0x01) != 0) {
				format = BluetoothGattCharacteristic.FORMAT_UINT16;
				Log.d(TAG, "Heart rate format UINT16.");
			} else {
				format = BluetoothGattCharacteristic.FORMAT_UINT8;
				Log.d(TAG, "Heart rate format UINT8.");
			}
			final int heartRate = characteristic.getIntValue(format, 1);
			Log.d(TAG, String.format("Received heart rate: %d", heartRate));
			intent.putExtra(EXTRA_DATA, String.valueOf(heartRate));
		} else {
			// For all other profiles, writes the data formatted in HEX.
			final byte[] data = characteristic.getValue();
			if (data != null && data.length > 0) {
				final StringBuilder stringBuilder = new StringBuilder(data.length);
				for (byte byteChar : data)
					stringBuilder.append(String.format("%02X ", byteChar));
				intent.putExtra(EXTRA_DATA, new String(data) + "\n" + stringBuilder.toString());
			}
		}
		sendBroadcast(intent);
	}

	public class LocalBinder extends Binder {
		BluetoothLeService getService() {
			return BluetoothLeService.this;
		}
	}

	@Override
	public IBinder onBind(Intent intent) {
		Log.d("dklog", ">>>>> onBind");
		return mBinder;
	}

	@Override
	public boolean onUnbind(Intent intent) {
		// After using a given device, you should make sure that
		// BluetoothGatt.close() is called
		// such that resources are cleaned up properly. In this particular
		// example, close() is
		// invoked when the UI is disconnected from the Service.
		Log.d("dklog", ">>>>> onUnbind");
		close();
		return super.onUnbind(intent);
	}

	private final IBinder mBinder = new LocalBinder();

	/**
	 * Initializes a reference to the local Bluetooth adapter.
	 * 
	 * @return Return true if the initialization is successful.
	 */
	public boolean initialize() {
		// For API level 18 and above, get a reference to BluetoothAdapter
		// through
		// BluetoothManager.
		if (mBluetoothManager == null) {
			mBluetoothManager = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
			if (mBluetoothManager == null) {
				Log.e(TAG, "Unable to initialize BluetoothManager.");
				return false;
			}
		}

		mBluetoothAdapter = mBluetoothManager.getAdapter();
		if (mBluetoothAdapter == null) {
			Log.e(TAG, "Unable to obtain a BluetoothAdapter.");
			return false;
		}

		return true;
	}

	public void discoveryService() {
		mBluetoothGatt.discoverServices();
	}

	/**
	 * Connects to the GATT server hosted on the Bluetooth LE device.
	 * 
	 * @param address
	 *            The device address of the destination device.
	 * 
	 * @return Return true if the connection is initiated successfully. The
	 *         connection result is reported asynchronously through the
	 *         {@code BluetoothGattCallback#onConnectionStateChange(android.bluetooth.BluetoothGatt, int, int)}
	 *         callback.
	 */
	public boolean connect(final String address) {
		Log.d("dklog", "[BluetoothLeService] - connect 1");
		if (mBluetoothAdapter == null || address == null) {
			Log.d("dklog", "BluetoothAdapter not initialized or unspecified address.");
			return false;
		}

		Log.d("dklog", "[BluetoothLeService] - connect 2");
		// Previously connected device. Try to reconnect.
		if (mBluetoothDeviceAddress != null && address.equals(mBluetoothDeviceAddress) && mBluetoothGatt != null) {
			Log.d(TAG, "Trying to use an existing mBluetoothGatt for connection.");
			if (mBluetoothGatt.connect()) {
				mConnectionState = STATE_CONNECTING;
				return true;
			} else {
				return false;
			}
		}

		Log.d("dklog", "[BluetoothLeService] - connect 3");
		final BluetoothDevice device = mBluetoothAdapter.getRemoteDevice(address);

		// boolean re = device.createBond();
		// System.out.println("=============��Խ��=" + re);

		if (device == null) {
			Log.w(TAG, "[BluetoothLeService] - Device not found.  Unable to connect.");
			return false;
		}

		Log.d("dklog", "[BluetoothLeService] - connect 4 address = " + address.toString());
		dfu_IsFirstDiscovery = true;

		// We want to directly connect to the device, so we are setting the
		// autoConnect
		// parameter to false.
		mBluetoothGatt = device.connectGatt(this, false, mGattCallback);

		devOperation = new DevOperation_X6(mBluetoothGatt);// ��ʼ������
		devDecode = new DevDecode_X6();

		Log.d(TAG, "Trying to create a new connection.");
		mBluetoothDeviceAddress = address;
		mConnectionState = STATE_CONNECTING;
		return true;
	}

	/**
	 * Disconnects an existing connection or cancel a pending connection. The
	 * disconnection result is reported asynchronously through the
	 * {@code BluetoothGattCallback#onConnectionStateChange(android.bluetooth.BluetoothGatt, int, int)}
	 * callback.
	 */
	public void disconnect() {
		if (mBluetoothAdapter == null || mBluetoothGatt == null) {
			Log.w(TAG, "BluetoothAdapter not initialized");
			return;
		}
		mBluetoothGatt.disconnect();
	}

	/**
	 * After using a given BLE device, the app must call this method to ensure
	 * resources are released properly.
	 */
	public void close() {
		if (mBluetoothGatt == null) {
			return;
		}
		mBluetoothGatt.close();
		mBluetoothGatt = null;
	}

	/**
	 * Request a read on a given {@code BluetoothGattCharacteristic}. The read
	 * result is reported asynchronously through the
	 * {@code BluetoothGattCallback#onCharacteristicRead(android.bluetooth.BluetoothGatt, android.bluetooth.BluetoothGattCharacteristic, int)}
	 * callback.
	 * 
	 * @param characteristic
	 *            The characteristic to read from.
	 */
	public void readCharacteristic(BluetoothGattCharacteristic characteristic) {
		if (mBluetoothAdapter == null || mBluetoothGatt == null) {
			Log.d("dklog", "BluetoothAdapter not initialized");
			return;
		}
		mBluetoothGatt.readCharacteristic(characteristic);
	}

	/**
	 * Enables or disables notification on a give characteristic.
	 * 
	 * @param characteristic
	 *            Characteristic to act on.
	 * @param enabled
	 *            If true, enable notification. False otherwise.
	 */
	public void setCharacteristicNotification(BluetoothGattCharacteristic characteristic, boolean enabled) {
		if (mBluetoothAdapter == null || mBluetoothGatt == null) {
			Log.d("dklog", "[BluetoothLeService] - BluetoothAdapter not initialized");
			return;
		}
		try {
			boolean re = mBluetoothGatt.setCharacteristicNotification(characteristic, enabled);
			System.out.println("setCharacteristicNotification=" + re);
		} catch (Exception e) {
			Log.d("dklog", "[BluetoothLeService] - setCharacteristicNotification error => " + e.getMessage());
			System.out.println("setCharacteristicNotification�쳣=" + e.toString());
		}

		try {
			BluetoothGattDescriptor descriptor = characteristic.getDescriptor(uUID_Notify);
			// System.out.println("===����mBluetoothGatt="+(mBluetoothGatt==null));
			// System.out.println("===����descriptor="+(descriptor==null));
			// System.out.println("===����ENABLE_NOTIFICATION_VALUE="+(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE==null));
			descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
			mBluetoothGatt.writeDescriptor(descriptor);
		} catch (Exception e) {
			System.out.println("writeDescriptor�쳣=" + e.toString());
			Log.d("dklog", "[BluetoothLeService] - writeDescriptor error => " + e.getMessage());
		}
		// }

		// -------------------------

	}

	/**
	 * Retrieves a list of supported GATT services on the connected device. This
	 * should be invoked only after {@code BluetoothGatt#discoverServices()}
	 * completes successfully.
	 * 
	 * @return A {@code List} of supported services.
	 */
	public List<BluetoothGattService> getSupportedGattServices() {
		if (mBluetoothGatt == null)
			return null;

		return mBluetoothGatt.getServices();
	}

	/**
	 * ��ȡ�豸��ǰ�˶�����
	 */
	public void readCurrentValue() {
		try {

			if (mBluetoothGatt == null) {
				return;
			}
			if (mConnectionState == STATE_DISCONNECTED) {// ���δ����
				return;
			}
			System.out.println("Bluetooth-��ȡ��ǰ��------------");
			readCharacteristic(cha_Operation_AirUpgrade);

		} catch (Exception e) {
			System.out.println("Bluetooth-��ȡ��ǰ�˶������쳣------------");
		}
	}

	/**
	 * �豸��λ
	 */
	public void resetDev_Normal(int type) {
		// 01������λϵͳ������02�ظ�Ĭ�ϲ�����03�����ʷ����
		try {

			if (mBluetoothGatt == null) {
				return;
			}
			if (mConnectionState == STATE_DISCONNECTED) {// ���δ����
				return;
			}

			System.out.println("������λ");

			// byte[] temp = switchAddr(mBluetoothDeviceAddress, true);
			// byte[] data = new byte[] { (byte) 0x40, (byte) 0x01, temp[0],
			// temp[1], temp[2], temp[3], temp[4], temp[5] };

			byte[] data_Reset = new byte[] { (byte) 0x40, (byte) type };// 01������λϵͳ������02�ظ�Ĭ�ϲ�����03�����ʷ����

			devOperation.writeCode(data_Reset, false);
			// System.out.println(byteToString(data));
			dfu_IsDFUReset = true;
		} catch (Exception e) {
			System.out.println("�豸��λ�쳣------------" + e.toString());
		}
	}

	// �����������쳣����λ
	public void resetDev_Upgrading() {
		try {
			initUpdate();
			// ����֪ͨ,����UUID���Ըı�ʱ����֪ͨ����onCharacteristicChanged�н�������
			// setCharacteristicNotification(cha_Operation, true);
			Thread.sleep(500);// ˯��500ms
			System.out.println("������λ------------");
			writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { 6 });// 05����̼�����λ��06ϵͳ��λ
		} catch (Exception e) {
			System.out.println("�豸��λ�쳣------------" + e.toString());
		}

	}

	/**
	 * �豸��λ
	 */
	public void resetDev_Upgrade(int type) {
		try {

			Log.d("dklog", "resetDev_Upgrade 1");
			if (mBluetoothGatt == null) {
				return;
			}
			Log.d("dklog", "resetDev_Upgrade 2");
			if (mConnectionState == STATE_DISCONNECTED) {// ���δ����
				return;
			}

			Log.d("dklog", "resetDev_Upgrade 3");
			dfu_IsDFUReset = false;// �ֻ��ѽ����������ģʽ����Ҫ����

			dfu_IsFirstDiscovery = false;// ��һ����������

			dfu_IsStartUpgrade = false;// �Ƿ���ʽ����
			dfu_IsReSend = false;// �Ͽ��ٴη���
			dfu_IsReSendCount = 0;// ���·��ͼ�¼

			dfu_FastCount = 200;// ��������һ�η������ݰ�����
			dfu_AirUpgradeCount = 0;// ��ǰд��ڼ�����
			dfu_ReceiveCount = 0;

			dfu_PackageCount = -1;// ������������������ͷ�ļ���
			dfu_LastPackageLength = -1;
			dfu_HistoryDataCount = 0;

			// initUpdate();
			// byte[] data = new byte[] { (byte) 0x25, (byte) 0x03, (byte) 0x40,
			// (byte) 0x01, (byte) 0x44, (byte) 0xdc, (byte) 0x26 };
			// mBluetoothDeviceAddress
			// byte[] data = new byte[] { (byte) 0xd4, (byte) 0xb0, (byte) 0x82,
			// (byte) 0x18, (byte) 0xe7, (byte) 0x46 };

			// ����֪ͨ,����UUID���Ըı�ʱ����֪ͨ����onCharacteristicChanged�н�������
			// setCharacteristicNotification(cha_Operiation_Write, true);
			isSetResetDevNotification = true;
			// Thread.sleep(500);
			// byte[] data = new byte[] { (byte) 0x46, (byte) 0xe7, (byte) 0x18,
			// (byte) 0x82, (byte) 0xb0, (byte) 0xd4 };

			System.out.println("��λ");

			byte[] temp = switchAddr(mBluetoothDeviceAddress, true);
			if (type == 0) {// x6��λ����,��ַ�ı�
				byte[] data = new byte[] { (byte) 0x40, (byte) 0x01, temp[0], temp[1], temp[2], temp[3], temp[4], temp[5] };
				devOperation.writeCode(data, false);
			} else if (type == 1) {
				// byte[] data = new byte[] { (byte) 0x40, (byte) 0x04, (byte)
				// 0x01// x6s��λ��������ַ����
				// };
				// devOperation.writeCode(data, false);

				byte[] data = new byte[] { (byte) 0x40, (byte) 0x04, (byte) 0x00 };// x6s��λ��������ַ�ı�
				devOperation.writeCode(data, false);
			} else if (type == 2) {// x6s��λ��������ַ�ı�
				byte[] data = new byte[] { (byte) 0x40, (byte) 0x04, (byte) 0x00 };
				devOperation.writeCode(data, false);
			}

			Log.d("dklog", "resetDev_Upgrade 4");
			// System.out.println(byteToString(data));
			dfu_IsDFUReset = true;
			activityHandler.obtainMessage(FitConstants.MSG_DFUHANDLER_READY, "").sendToTarget();
			
		} catch (Exception e) {
			System.out.println("�豸��λ�쳣------------" + e.toString());
		}
	}

	// ��MAC��ַ����ת�����û��̼�����
	private byte[] switchAddr(String add, boolean isReverse) {// �Ƿ���
		byte[] data = new byte[6];

		add = add.replaceAll(" ", "");
		add = add.replaceAll(":", "");

		String bit[] = new String[6];
		bit[0] = add.substring(0, 2);
		bit[1] = add.substring(2, 4);
		bit[2] = add.substring(4, 6);
		bit[3] = add.substring(6, 8);
		bit[4] = add.substring(8, 10);
		bit[5] = add.substring(10, 12);
		//
		// for (int i = 0; i < bit.length; i++) {
		// System.out.println("---ת�����" + bit[i]);
		// // data[i] = (byte) (Integer.parseInt(("0x" + bit[i])));
		// }
		if (isReverse) {
			add = bit[5] + bit[4] + bit[3] + bit[2] + bit[1] + bit[0];
		} else {
			add = bit[0] + bit[1] + bit[2] + bit[3] + bit[4] + bit[5];
		}

		// System.out.println("ת�����" + add.replaceAll(":", ""));
		data = HexString2Bytes(add);
		// System.out.println("ת�����" + byteToString(data));

		return data;
	}

	/**
	 * ��ָ���ַ���src����ÿ�����ַ��ָ�ת��Ϊ16������ʽ �磺"2B44EFD9" --> byte[]{0x2B, 0x44, 0xEF,
	 * 0xD9}
	 */
	public static byte[] HexString2Bytes(String src) {
		int length = src.length() / 2;
		byte[] ret = new byte[length];
		byte[] tmp = src.getBytes();
		for (int i = 0; i < length; i++) {
			ret[i] = uniteBytes(tmp[i * 2], tmp[i * 2 + 1]);
		}
		return ret;
	}

	/**
	 * ������ASCII�ַ��ϳ�һ���ֽڣ� �磺"EF"--> 0xEF
	 * 
	 * @param src0
	 *            byte
	 * @param src1
	 *            byte
	 * @return byte
	 */
	public static byte uniteBytes(byte src0, byte src1) {
		byte _b0 = Byte.decode("0x" + new String(new byte[] { src0 })).byteValue();
		_b0 = (byte) (_b0 << 4);
		byte _b1 = Byte.decode("0x" + new String(new byte[] { src1 })).byteValue();
		byte ret = (byte) (_b0 ^ _b1);
		return ret;
	}

	/**
	 * �̼���λ
	 */
	public void resetHardWare() {
		try {

			if (mBluetoothGatt == null) {

				connect(mBluetoothDeviceAddress);
				return;
			}
			if (mConnectionState == STATE_DISCONNECTED) {// ���δ����
				return;
			}
			if (mBluetoothGatt != null) {
				service_Reset = mBluetoothGatt.getService(uUID_Service_Dev_Operiation);

				if (service_Main != null) {
					cha_ResetDev = service_Reset.getCharacteristic(uUID_Cha_Operiation_Write);
				}
			}
			System.out.println("��λ");
			writeCharacteristic(cha_Operation_AirUpgrade, new byte[] { (byte) 6 });

		} catch (Exception e) {
			System.out.println("Bluetooth-��ȡ��ǰ�˶������쳣------------");
		}
	}

	public void airUpgrade(byte[] d) {
		Update(d);
	}

	/**
	 * �̼�����
	 */
	public void Update(byte[] d) {
		dfu_File_Data = d;
		
		Log.d("dklog", ">>>>> Update 1");
		
		initUpdate();
		// System.out.println("д���������f-01");
		// wirteCharacteristic(controlcha, new byte[] { (byte) 1, (byte) 0 });//
		// control

		System.out.println("��ʼ����=------------");
		System.out.println("pairService=" + service_Main);
		System.out.println("paircha=" + cha_Write_Image_AirUpgrade);
		System.out.println("controlcha=" + cha_Operation_AirUpgrade);
		System.out.println("crc_CLIENT_CHARACTERISTIC_CONFIG=" + uUID_Cha_Crc_CHARACTERISTIC_CONFIG.toString());

		int index_x = 0;
		for (int i = 0; i < 16; i++) {
			fileNameDescription[i] = dfu_File_Data[i];
		}
		index_x = index_x + 16;
		for (int i = index_x; i < index_x + 8; i++) {
			fileCreateTime[i - index_x] = dfu_File_Data[i];
		}
		index_x = index_x + 8;

		for (int i = index_x; i < index_x + 4; i++) {
			version[i - index_x] = dfu_File_Data[i];

		}
		index_x = index_x + 4;
		for (int i = index_x; i < index_x + 4; i++) {
			imgageSize[i - index_x] = dfu_File_Data[i];
		}

		index_x = index_x + 4;
		for (int i = index_x; i < index_x + 4; i++) {
			crc[i - index_x] = dfu_File_Data[i];
		}

		index_x = index_x + 4;
		for (int i = 0; i < 4; i++) {
			crc_version[i] = crc[i];
		}
		for (int i = 4; i < 8; i++) {
			crc_version[i] = version[i - 4];
		}

		dfu_PackageCount = (dfu_File_Data.length - 256) / 20;
		dfu_LastPackageLength = (dfu_File_Data.length - 256) % 20;

		if (dfu_LastPackageLength != 0) {// ����������Ŀ��1
			dfu_PackageCount++;
		}
		Log.d("dklog", ">>>>> Update 2");
		try {
			String createdateString;
			int createdate = 0;
			// �ļ� ����ʱ�� ����ʱ�� ��8���ֽڣ� �ֽڣ� ��(2) ��(1) ��(1) ʱ(1) ��(1) ��(1) ���� (
			createdate = devDecode.bytesToInt2_2Bytes(new byte[] { fileCreateTime[0], fileCreateTime[1] });// year
			createdateString = createdate + "-" + (int) fileCreateTime[2] + "-" + (int) fileCreateTime[3] + " " + (int) fileCreateTime[4] + ":" + (int) fileCreateTime[5];

			String versionString = (int) version[3] + "." + (int) version[2] + "." + (int) version[1] + "." + (int) version[0];

			String descriptionString = new String(fileNameDescription, "UTF-8");
			// System.out.println("�ļ���=" + descriptionString);
			// System.out.println("�ļ�����ʱ��=" + createdateString);
			// System.out.println("�汾��=" + versionString);

			// ���԰���Ҫ�滻
			// descriptionString=descriptionString.replace("Vidonn",
			// "");//��Ψ�������滻
			// descriptionString=descriptionString.replace("vidonn",
			// "");//��Ψ�������滻

			activityHandler.obtainMessage(0, getResources().getString(R.string.upgrade_file_description) + descriptionString).sendToTarget();
			activityHandler.obtainMessage(0, getResources().getString(R.string.upgrade_file_createtime) + createdateString).sendToTarget();
			activityHandler.obtainMessage(0, getResources().getString(R.string.upgrade_file_version) + versionString).sendToTarget();

			int fileType = 0;
			if (descriptionString.toLowerCase().contains("x6c")) {
				fileType = 1;
			} else if (descriptionString.toLowerCase().contains("x6s")) {
				fileType = 2;
			} else if (descriptionString.toLowerCase().contains("x6")) {
				fileType = 0;
			}

			
			if (devType != fileType) {// ���Ƕ�Ӧ�̼�
//				System.out.println(getResources().getString(R.string.upgrade_file_not_adpater));
				activityHandler.obtainMessage(13, "FAIL").sendToTarget();
				String strType = String.format("devType = %d, fileType = %d", devType, fileType);
				Log.d("dklog", ">>>>> devType != fileType ==> " + strType.toString());
				return;
			}

		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			Log.d("dklog", ">>>>> error " + e.getMessage());
			e.printStackTrace();
		}

//		System.out.println(getResources().getString(R.string.upgrade_all_packages) + dfu_PackageCount + getResources().getString(R.string.upgrade_all_packages_lave) + dfu_LastPackageLength);
//		activityHandler.obtainMessage(0, getResources().getString(R.string.upgrade_all_packages) + dfu_PackageCount + getResources().getString(R.string.upgrade_all_packages_lave) + dfu_LastPackageLength).sendToTarget();
		activityHandler.obtainMessage(11, dfu_PackageCount + 1).sendToTarget();

		System.out.println("fileNameDescription:\n" + byteToString(fileNameDescription));
		System.out.println("fileCreateTime:\n" + byteToString(fileCreateTime));
		System.out.println("version:\n" + byteToString(version));
		System.out.println("imgageSize:\n" + byteToString(imgageSize));
		System.out.println("crc:\n" + byteToString(crc));
		System.out.println("crc_version:\n" + byteToString(crc_version));

		// try {

		if (mBluetoothGatt == null) {
			Log.d("dklog", ">>>>> mBluetoothGatt == null ");
			return;
		}
		if (mConnectionState == STATE_DISCONNECTED) {// ���δ����
			Log.d("dklog", ">>>>> mConnectionState == STATE_DISCONNECTED ");
			return;
		}

		if (service_Main == null) {
			Log.d("dklog", ">>>>> service_Main == null");
			return;
		}

		if (cha_Write_Image_AirUpgrade == null) {
			Log.d("dklog", ">>>>> cha_Write_Image_AirUpgrade ");
			return;
		}

		dfu_xval = new byte[dfu_PackageCount][20];

		for (int i = 0; i < dfu_xval.length - 1; i++) {
			for (int j = 0; j < 20; j++) {
				int index = 256 + 20 * i + j;
				dfu_xval[i][j] = dfu_File_Data[index];
			}
		}

		// ���һ�����ݰ�
		if (dfu_LastPackageLength == 0) {// �������
			dfu_LastPackageLength = 20;
		}
		dfu_xval_Last = new byte[dfu_LastPackageLength];
		for (int i = 0; i < dfu_LastPackageLength; i++) {
			int index = 256 + 20 * (dfu_xval.length - 1) + i;
			// xval[xval.length - 1][i] = data[index];

			dfu_xval_Last[i] = dfu_File_Data[index];
		}

		writeStatus_op1 = 0;
		writeStatus_op8 = 0;
		writeStatus_opSize = 0;

		writeStatus_op2 = 0;
		writeStatus_opCRC = 0;
		writeStatus_op3 = 0;

		Log.d("dklog", ">>>>> Update 3");
		// ����֪ͨ,����UUID���Ըı�ʱ����֪ͨ����onCharacteristicChanged�н�������
		setCharacteristicNotification(cha_Operation_AirUpgrade, true);

		// } catch (Exception e) {
		// e.printStackTrace();
		// System.out.println("Bluetooth-д��֪ͨ�쳣------------" + e.toString());
		// activityHandler.obtainMessage(0, "Bluetooth-д��֪ͨ�쳣").sendToTarget();
		// }

	}

	public void initUpdate() {
		if (mBluetoothGatt != null) {
			service_Main = mBluetoothGatt.getService(uUID_Service_Main);

			if (service_Main != null) {
				cha_Write_Image_AirUpgrade = service_Main.getCharacteristic(uUID_Cha_AirUpgrade_Img);
				cha_Operation_AirUpgrade = service_Main.getCharacteristic(uUID_Cha_Operation);
			}
		}
	}

	public void inintUUID() {
		Log.d("dklog", "[BluetoothLeService] - inintUUID 1");
		// try {
		if (mBluetoothGatt != null) {
			Log.d("dklog", "[BluetoothLeService] - inintUUID 2");
			service_Dev_Operiation = mBluetoothGatt.getService(uUID_Service_Dev_Operiation);
			service_Dev_Operiation_Current = mBluetoothGatt.getService(uUID_Service_Dev_Operiation_Current);

			if (DFUHandler.dfu_DeviceName.toLowerCase().contains("dfu")) {// ����ģʽ��
				try {// ��ȡ�豸����
						// ��׼��Ϣ
					service_Dev_Info = mBluetoothGatt.getService(uUID_Service_Dev_Info);
					cha_Info_ModelType = service_Dev_Info.getCharacteristic(uUID_Cha_Dev_Info_ModelType);
					Log.d("dklog", "[BluetoothLeService] - inintUUID 3");
					if (cha_Info_ModelType != null) {// x6c ,x6s�и���
						Log.d("dklog", "[BluetoothLeService] - inintUUID 4");
						readCharacteristic(cha_Info_ModelType);// ��ȡ�豸����
					} else {// x6�豸
						Log.d("dklog", "[BluetoothLeService] - inintUUID 5");
						devType = 0;
						devTypeString = "X6";
					}

				} catch (Exception e) {
					Log.d("dklog", "[BluetoothLeService] - inintUUID 6 error = " + e.getMessage());
					cha_Info_ModelType = null;
				}
			} else {
				Log.d("dklog", "[BluetoothLeService] - inintUUID 11");
				service_Dev_Info = mBluetoothGatt.getService(uUID_Service_Dev_Info);
				try {
					cha_Info_Fireware = service_Dev_Info.getCharacteristic(uUID_Cha_Dev_Info_Fireware);
					Log.d("dklog", "[BluetoothLeService] - inintUUID 12");
				} catch (Exception e) {
					System.out.println("----��ʼ��UUID�쳣cha_Info_Fireware" + e.toString());
					Log.d("dklog", "[BluetoothLeService] - inintUUID 12-1");
				}
				try {
					cha_Info_Hardware = service_Dev_Info.getCharacteristic(uUID_Cha_Dev_Info_Hardware);
					Log.d("dklog", "[BluetoothLeService] - inintUUID 13");
				} catch (Exception e) {
					System.out.println("----��ʼ��UUID�쳣cha_Info_Hardware" + e.toString());
					Log.d("dklog", "[BluetoothLeService] - inintUUID 13-1");
				}
				try {
					cha_Info_Software = service_Dev_Info.getCharacteristic(uUID_Cha_Dev_Info_Software);
					Log.d("dklog", "[BluetoothLeService] - inintUUID 14");
				} catch (Exception e) {
					System.out.println("----��ʼ��UUID�쳣cha_Info_Software" + e.toString());
					Log.d("dklog", "[BluetoothLeService] - inintUUID 14-1");
				}
				try {
					cha_Info_Manufacturer = service_Dev_Info.getCharacteristic(uUID_Cha_Dev_Info_Manufacturer);
					Log.d("dklog", "[BluetoothLeService] - inintUUID 15");
				} catch (Exception e) {
					System.out.println("----��ʼ��UUID�쳣cha_Info_Manufacturer" + e.toString());
					Log.d("dklog", "[BluetoothLeService] - inintUUID 15-1");
				}

				try {
					service_Dev_Info_Battery = mBluetoothGatt.getService(uUID_Service_Dev_Info_Battery);
					Log.d("dklog", "[BluetoothLeService] - inintUUID 16");
				} catch (Exception e) {
					System.out.println("----��ʼ��UUID�쳣service_Dev_Info_Battery" + e.toString());
					Log.d("dklog", "[BluetoothLeService] - inintUUID 16-1");
				}
				try {
					cha_Info_Battery = service_Dev_Info_Battery.getCharacteristic(uUID_Cha_Dev_Info_Battery);
					Log.d("dklog", "[BluetoothLeService] - inintUUID 17");
				} catch (Exception e) {
					System.out.println("----��ʼ��UUID�쳣cha_Info_Battery" + e.toString());
					Log.d("dklog", "[BluetoothLeService] - inintUUID 17-1");
				}
				try {
					cha_Info_ModelType = service_Dev_Info_Battery.getCharacteristic(uUID_Cha_Dev_Info_ModelType);
					Log.d("dklog", "[BluetoothLeService] - inintUUID 18");
				} catch (Exception e) {
//					System.out.println("----��ʼ��UUID�쳣cha_Info_ModelType" + e.toString());
					Log.d("dklog", "[BluetoothLeService] - inintUUID 18-1");
					Log.d("dklog", "cha_Info_ModelType error = " + e.toString());
				}

				try {
					// ����ģʽ
					cha_Operiation_Read = service_Dev_Operiation.getCharacteristic(uUID_Cha_Operiation_Read);
					Log.d("dklog", "[BluetoothLeService] - inintUUID 19");
				} catch (Exception e) {
					System.out.println("----��ʼ��UUID�쳣cha_Operiation_Read" + e.toString());
					Log.d("dklog", "[BluetoothLeService] - inintUUID 19-1");
				}
				try {
					cha_Operiation_NotificationData = service_Dev_Operiation.getCharacteristic(uUID_Cha_Operiation_NotificationData);
					Log.d("dklog", "[BluetoothLeService] - inintUUID 20");
				} catch (Exception e) {
					System.out.println("----��ʼ��UUID�쳣cha_Operiation_NotificationData" + e.toString());
					Log.d("dklog", "[BluetoothLeService] - inintUUID 20-1");
				}
				try {
					cha_Operiation_Write = service_Dev_Operiation.getCharacteristic(uUID_Cha_Operiation_Write);
					Log.d("dklog", "[BluetoothLeService] - inintUUID 21");
					devOperation.setWriteCharacteristic(cha_Operiation_Write);
				} catch (Exception e) {
					System.out.println("----��ʼ��UUID�쳣cha_Operiation_Write" + e.toString());
					Log.d("dklog", "[BluetoothLeService] - inintUUID 21-1");
				}

				try {
					cha_Operiation_Read_Current = service_Dev_Operiation_Current.getCharacteristic(uUID_Cha_Operiation_Read_Current);
					Log.d("dklog", "[BluetoothLeService] - inintUUID 22");
					devOperation.setWriteCharacteristic_NotificationData(cha_Operiation_NotificationData);
				} catch (Exception e) {
					System.out.println("----��ʼ��UUID�쳣cha_Operiation_Read_Current" + e.toString());
					Log.d("dklog", "[BluetoothLeService] - inintUUID 22-1");
				}

			}
			Log.d("dklog", "[BluetoothLeService] - go to setNotificatio");
			setNotificatio();
			
		}
		// } catch (Exception e) {
		// System.out.println("--------------------��ʼ��UUID�쳣" + e.toString());
		// }
	}

	/**
	 * ����notification֪ͨ
	 */
	public void setNotificatio() {
		try {
			setNotification_ID = 1;
			// if (cha_Operiation_Read_Current != null) {
			// ����֪ͨ,����UUID���Ըı�ʱ����֪ͨ����onCharacteristicChanged�н�������
			setCharacteristicNotification(cha_Operiation_Read_Current, true);
			// }

		} catch (Exception e) {
			// TODO: handle exception
		}
	}

	public void readDevHardInfo() {
		// inintUUID();
		// ����֪ͨ,����UUID���Ըı�ʱ����֪ͨ����onCharacteristicChanged�н�������
		readCharacteristic(cha_Info_Hardware);
	}

	public void readDevSoftInfo() {
		readCharacteristic(cha_Info_Software);
	}

	public void readDevFirmwareInfo() {
		readCharacteristic(cha_Info_Fireware);
	}

	public void readDevManufacturer() {
		readCharacteristic(cha_Info_Manufacturer);
	}

	public void readDevBatteryInfo() {
		readCharacteristic(cha_Info_Battery);
	}

	public void writeOpCode(byte[] value) {
		writeCharacteristic(cha_Operation_AirUpgrade, value);// control
	}

	public void writeImage(byte[] value) {
		writeCharacteristic(cha_Write_Image_AirUpgrade, value);// image
	}

	/**
	 * д������
	 */
	private void writeCharacteristic(BluetoothGattCharacteristic characteristic, byte[] value) {
		if ((this.mBluetoothAdapter == null) || (this.mBluetoothGatt == null)) {
			Log.e(TAG, "BluetoothAdapter not initialized");
			return;
		}
		if (mConnectionState == STATE_DISCONNECTED) {// ���δ����
			return;
		}
		try {
			characteristic.setValue(value);
			characteristic.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);// 1,2,4
			// System.out.println("BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE="
			// + BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
			// System.out.println("BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT="
			// + BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
			// System.out.println("BluetoothGattCharacteristic.WRITE_TYPE_SIGNED="
			// + BluetoothGattCharacteristic.WRITE_TYPE_SIGNED);

			this.mBluetoothGatt.writeCharacteristic(characteristic);
		} catch (Exception e) {
			disconnect();// �Ͽ�����
			// close();// �ر�����
		}

	}

	/**
	 * byte������תString��ʾ
	 */
	private String byteToString(byte[] data) {
		StringBuilder stringBuilder = new StringBuilder(data.length);
		for (byte byteChar : data) {
			stringBuilder.append(String.format("%02X ", byteChar).toString());
		}
		return stringBuilder.toString();
	}

	public void sendFirmwareImg() {
		if (dfu_AirUpgradeCount < (dfu_PackageCount - 1)) {// û��д��̼�
			System.out.println("write image count=" + dfu_AirUpgradeCount);
			writeCharacteristic(cha_Write_Image_AirUpgrade, dfu_xval[dfu_AirUpgradeCount]);
		} else if (dfu_AirUpgradeCount == (dfu_PackageCount - 1)) {// ���һ�����ݰ�������
			System.out.println("write image count=" + dfu_AirUpgradeCount);
			writeCharacteristic(cha_Write_Image_AirUpgrade, dfu_xval_Last);
		}
	}

	public int dfu_Flag_Send_id = 0;// ���_���ͱ�־
	Thread checkWritefirmwareImgThread = new Thread() {

		@Override
		public void run() {
			dfu_Flag_Send_id = dfu_AirUpgradeCount;// ������ʱ���ѷ���ID

			while (dfu_IsStartUpgrade) {// ��д�뾵���ļ�
				try {
					Thread.sleep(600);// ����ǰ�棬������������
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				// /////////////////////////////////////////////////////////
				synchronized (dfu_AirUpgradeCount) {// ����
					if (dfu_AirUpgradeCount == dfu_Flag_Send_id) {// ��һ��ʱ���飬���û�б仯����ʾ���Ͳ��ɹ�
						System.out.println("--���ݰ���д");
						sendFirmwareImg();
					} else {// id����ȣ�˵�������Ѿ������������ߣ���¼���±��
						dfu_Flag_Send_id = dfu_AirUpgradeCount;// ������ʱ���ѷ���ID
					}
				}
			}
		}

	};
}
