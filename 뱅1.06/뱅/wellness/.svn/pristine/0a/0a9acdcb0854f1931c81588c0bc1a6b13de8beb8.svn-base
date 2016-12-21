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

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;

import com.uracle.wellness.R;

import android.app.AlertDialog;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.PowerManager;
import android.telephony.SmsMessage;
import android.telephony.TelephonyManager;
import android.text.InputType;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ExpandableListView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.SimpleExpandableListAdapter;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;
import m.client.android.library.core.common.DataHandler;
import m.client.android.library.core.common.Parameters;
import m.client.android.library.core.model.NetReqOptions;
import m.client.android.library.core.view.AbstractActivity;

/**
 * For a given BLE device, this Activity provides the user interface to connect,
 * display data, and display GATT services and characteristics supported by the
 * device. The Activity communicates with {@code BluetoothLeService}, which in
 * turn interacts with the Bluetooth LE API.
 */
public class DeviceControlActivity extends AbstractActivity implements OnClickListener {
	private final static String TAG = DeviceControlActivity.class.getSimpleName();

	// byte[] personalInfo;// ������Ϣ
	// ------------------------

	public static final String EXTRAS_DEVICE_NAME = "DEVICE_NAME";
	public static final String EXTRAS_DEVICE_ADDRESS = "DEVICE_ADDRESS";

	public static final String FILEDIR_STRING = "Vidonn2";
	// public static final String FILEDIR_STRING = "SmartBand";

	private TextView mConnectionState;
	public static String mDeviceName;
	private String mDeviceAddress;
//	private ExpandableListView mGattServicesList;
	private BluetoothLeService mBluetoothLeService;
	private ArrayList<ArrayList<BluetoothGattCharacteristic>> mGattCharacteristics = new ArrayList<ArrayList<BluetoothGattCharacteristic>>();
	private boolean mConnected = false;
	private boolean isDiscoverService = false;
	private boolean isband = true;
	private BluetoothGattCharacteristic mNotifyCharacteristic;

	private int sendNotifyID = 0;

	private final String LIST_NAME = "NAME";
	private final String LIST_UUID = "UUID";

	private LinearLayout devOperationLayout;

//	private RelativeLayout relativeLayout_CMD;
//	private Button btCMDControl;

//	private TextView receiveTextViewAll, receiveTextViewShow;
	private Button bt11, bt12, bt13, bt14;
	private Button bt21, bt22, bt23, bt24;
	private Button bt31, bt32, bt33, bt34;
	private Button bt41, bt42, bt43, bt44;
	private Button bt45, bt46, bt47, bt48;
	private Button bt51, bt52, bt53;
	private Button bt61, bt62, bt63, bt64;

	private ProgressBar updateBar;
	private TextView updatetextView, update_CounTextView;

	int n = 0;
	int allcount = 0;
	private static String filePath = Environment.getExternalStorageDirectory().getAbsolutePath() + File.separator + "bang.bin";
//			 
//			"/data/data/com.uracle.wellness/files/bang.bin";
	//
	private PowerManager.WakeLock wl;

	Handler mHandler = new Handler() {

		@Override
		public void handleMessage(Message msg) {
			// TODO Auto-generated method stub
			super.handleMessage(msg);
			n++;
			switch (msg.what) {

			case 0:// ��ʾ��Ϣ
//				receiveTextViewAll.append("\n" + msg.obj);
//				receiveTextViewShow.setText("" + msg.obj);

				break;
			case 2:// �ֻ��Ѿ���λ��ɣ������ɹ�
					// Toast.makeText(getApplicationContext(), "�Ѿ���λ��ɣ���ѡ�������ļ�",
					// Toast.LENGTH_LONG).show();
				break;
			case 3:// ���Ե���������ݰ�ť
				Toast.makeText(getApplicationContext(), "You can click " + getResources().getString(R.string.btn_sendMsgData), Toast.LENGTH_LONG).show();
				break;
			case 11:// ����������
				Log.d("dklog", ">>>>> handler 11");
				allcount = (Integer) msg.obj;
				allcount--;
				break;

			case 12:// ��������
				Log.d("dklog", ">>>>> handler 12");
				if (allcount == 0) {
					break;
				}

				int process = (Integer) msg.obj;
				update_CounTextView.setText(process + " ");

				if (allcount == process) {
					int[] time = getCurrentTime();
//					receiveTextViewAll.append("\n" + getResources().getString(R.string.tip_endtime) + ":" + time[3] + ":" + time[4] + ":" + time[5] + "\n");
				}

				process = process * 100 / allcount;
				updatetextView.setText(process + "%");
				updateBar.setProgress(process);
				break;

			case 20:// ��ȡ�ļ����ݷ���
				Log.d("dklog", ">>>>> handler 20");
				byte[] data_byte = (byte[]) msg.obj;
				mBluetoothLeService.airUpgrade(data_byte);
				break;

			default:
				break;
			}

		}

	};

	// Code to manage Service lifecycle.
	private final ServiceConnection mServiceConnection = new ServiceConnection() {

		@Override
		public void onServiceConnected(ComponentName componentName, IBinder service) {
			mBluetoothLeService = ((BluetoothLeService.LocalBinder) service).getService();
			if (!mBluetoothLeService.initialize()) {
				Log.e(TAG, "Unable to initialize Bluetooth");
				finish();
			}
			// Automatically connects to the device upon successful start-up
			// initialization.
			mBluetoothLeService.connect(mDeviceAddress);
			mBluetoothLeService.setHandler(mHandler);
		}

		@Override
		public void onServiceDisconnected(ComponentName componentName) {
			mBluetoothLeService = null;
		}
	};

	// Handles various events fired by the Service.
	// ACTION_GATT_CONNECTED: connected to a GATT server.
	// ACTION_GATT_DISCONNECTED: disconnected from a GATT server.
	// ACTION_GATT_SERVICES_DISCOVERED: discovered GATT services.
	// ACTION_DATA_AVAILABLE: received data from the device. This can be a
	// result of read
	// or notification operations.
	private final BroadcastReceiver mGattUpdateReceiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			final String action = intent.getAction();

			if (action.equals("android.provider.Telephony.SMS_RECEIVED")) {// �յ�����

				StringBuffer SMSAddress = new StringBuffer();
				StringBuffer SMSContent = new StringBuffer();
				Bundle bundle = intent.getExtras();
				if (bundle != null) {
					Object[] pdusObjects = (Object[]) bundle.get("pdus");
					SmsMessage[] messages = new SmsMessage[pdusObjects.length];
					for (int i = 0; i < pdusObjects.length; i++) {
						messages[i] = SmsMessage.createFromPdu((byte[]) pdusObjects[i]);
					}
					for (SmsMessage message : messages) {
						SMSAddress.append(message.getDisplayOriginatingAddress());
						SMSContent.append(message.getDisplayMessageBody());
					}
				}
//				receiveTextViewAll.append("�ֻ�����" + SMSAddress + "��������: " + SMSContent);
				System.out.println("�ֻ�����" + SMSAddress + "��������: " + SMSContent);

			} else if (action.equals(TelephonyManager.ACTION_PHONE_STATE_CHANGED)) {// ������

				TelephonyManager telephony = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
				int state = telephony.getCallState();

				String phoneNumber = intent.getStringExtra("incoming_number");

				System.out.println("�ֻ�����" + phoneNumber);
//				receiveTextViewAll.append("�ֻ�����" + phoneNumber);
				switch (state) {
				case TelephonyManager.CALL_STATE_RINGING:
					// Log.i(TAG, "[Broadcast]�ȴ��ӵ绰=" + phoneNumber);
					break;
				case TelephonyManager.CALL_STATE_IDLE:
					// Log.i(TAG, "[Broadcast]�绰�Ҷ�=" + phoneNumber);
					break;
				case TelephonyManager.CALL_STATE_OFFHOOK:
					// Log.i(TAG, "[Broadcast]ͨ����=" + phoneNumber);
					break;
				}
			}

			if (BluetoothLeService.ACTION_GATT_CONNECTED.equals(action)) {
				mConnected = true;
				updateConnectionState(R.string.connected);
				invalidateOptionsMenu();
			} else if (BluetoothLeService.ACTION_GATT_DISCONNECTED.equals(action)) {
				isDiscoverService = false;
				mConnected = false;
				updateConnectionState(R.string.disconnected);
				invalidateOptionsMenu();
				clearUI();
			} else if (BluetoothLeService.ACTION_GATT_SERVICES_DISCOVERED.equals(action)) {
				// Show all the supported services and characteristics on the
				// user interface.
				isDiscoverService = true;
				displayGattServices(mBluetoothLeService.getSupportedGattServices());
				mBluetoothLeService.inintUUID();// ��ʼ��
			} else if (BluetoothLeService.ACTION_DATA_AVAILABLE.equals(action)) {

			} else if (BluetoothLeService.READ_DEV_OPERATION.equals(action)) {// ��д��������
				// devOperationLayout.setVisibility(View.VISIBLE);
			}

		}
	};

	// If a given GATT characteristic is selected, check for supported features.
	// This sample
	// demonstrates 'Read' and 'Notify' features. See
	// http://d.android.com/reference/android/bluetooth/BluetoothGatt.html for
	// the complete
	// list of supported characteristic features.
	private final ExpandableListView.OnChildClickListener servicesListClickListner = new ExpandableListView.OnChildClickListener() {
		@Override
		public boolean onChildClick(ExpandableListView parent, View v, int groupPosition, int childPosition, long id) {
			if (mGattCharacteristics != null) {
				final BluetoothGattCharacteristic characteristic = mGattCharacteristics.get(groupPosition).get(childPosition);
				final int charaProp = characteristic.getProperties();
				if ((charaProp | BluetoothGattCharacteristic.PROPERTY_READ) > 0) {
					// If there is an active notification on a characteristic,
					// clear
					// it first so it doesn't update the data field on the user
					// interface.
					if (mNotifyCharacteristic != null) {
						mBluetoothLeService.setCharacteristicNotification(mNotifyCharacteristic, false);
						mNotifyCharacteristic = null;
					}
					mBluetoothLeService.readCharacteristic(characteristic);
				}
				if ((charaProp | BluetoothGattCharacteristic.PROPERTY_NOTIFY) > 0) {
					mNotifyCharacteristic = characteristic;
					mBluetoothLeService.setCharacteristicNotification(characteristic, true);
				}
				return true;
			}
			return false;
		}
	};

	private void clearUI() {
//		mGattServicesList.setAdapter((SimpleExpandableListAdapter) null);
	}

	public class Const {
		// http parameters
		public static final int HTTP_MEMORY_CACHE_SIZE = 2 * 1024 * 1024; // 2MB
		public static final int HTTP_DISK_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
		public static final String HTTP_DISK_CACHE_DIR_NAME = "netroid";
		public static final String USER_AGENT = "netroid.cn";
	}

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.gatt_services_characteristics);

		PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
		wl = pm.newWakeLock(PowerManager.SCREEN_DIM_WAKE_LOCK, "MyTag");

//		Netroid.init(this); // ��ʼ��

		final Intent intent = getIntent();
		mDeviceName = intent.getStringExtra(EXTRAS_DEVICE_NAME);
		mDeviceAddress = intent.getStringExtra(EXTRAS_DEVICE_ADDRESS);

//		relativeLayout_CMD = (RelativeLayout) findViewById(R.id.RelativeLayout_CMD);
//		btCMDControl = (Button) findViewById(R.id.button_CMD_Control);

//		receiveTextViewAll = (TextView) findViewById(R.id.Receive_textView);
//		receiveTextViewShow = (TextView) findViewById(R.id.textView_rec);

		devOperationLayout = (LinearLayout) findViewById(R.id.linearLayout_Read_Write);
		devOperationLayout.setVisibility(View.GONE);

		bt11 = (Button) findViewById(R.id.button11);
		bt12 = (Button) findViewById(R.id.button12);
		bt13 = (Button) findViewById(R.id.button13);
		bt14 = (Button) findViewById(R.id.button14);

		bt21 = (Button) findViewById(R.id.button21);
		bt22 = (Button) findViewById(R.id.button22);
		bt23 = (Button) findViewById(R.id.button23);
		bt24 = (Button) findViewById(R.id.button24);

		bt31 = (Button) findViewById(R.id.button31);
		bt32 = (Button) findViewById(R.id.button32);
		bt33 = (Button) findViewById(R.id.button33);
		bt34 = (Button) findViewById(R.id.button34);

		bt41 = (Button) findViewById(R.id.button41);
		bt42 = (Button) findViewById(R.id.button42);
		bt43 = (Button) findViewById(R.id.button43);
		bt44 = (Button) findViewById(R.id.button44);

		bt51 = (Button) findViewById(R.id.button51);
		bt52 = (Button) findViewById(R.id.button52);
		bt53 = (Button) findViewById(R.id.button53);

		bt61 = (Button) findViewById(R.id.button61);
		bt62 = (Button) findViewById(R.id.button62);
		bt63 = (Button) findViewById(R.id.button63);
		bt64 = (Button) findViewById(R.id.button64);

		updateBar = (ProgressBar) findViewById(R.id.update_progressBar);
		updatetextView = (TextView) findViewById(R.id.update_textView);
		update_CounTextView = (TextView) findViewById(R.id.update_Count_textView);

//		btCMDControl.setOnClickListener(this);
//		receiveTextViewShow.setOnClickListener(this);

		bt11.setOnClickListener(this);
		bt12.setOnClickListener(this);
		bt13.setOnClickListener(this);
		bt14.setOnClickListener(this);

		bt21.setOnClickListener(this);
		bt22.setOnClickListener(this);
		bt23.setOnClickListener(this);
		bt24.setOnClickListener(this);

		bt31.setOnClickListener(this);
		bt32.setOnClickListener(this);
		bt33.setOnClickListener(this);
		bt34.setOnClickListener(this);

		bt41.setOnClickListener(this);
		bt42.setOnClickListener(this);
		bt43.setOnClickListener(this);
		bt44.setOnClickListener(this);

		bt51.setOnClickListener(this);
		bt52.setOnClickListener(this);
		bt53.setOnClickListener(this);

		bt61.setOnClickListener(this);
		bt62.setOnClickListener(this);
		bt63.setOnClickListener(this);
		bt64.setOnClickListener(this);

		// Sets up UI references.
		((TextView) findViewById(R.id.device_address)).setText(mDeviceAddress);
//		mGattServicesList = (ExpandableListView) findViewById(R.id.gatt_services_list);
//		mGattServicesList.setOnChildClickListener(servicesListClickListner);
		mConnectionState = (TextView) findViewById(R.id.connection_state);

		getActionBar().setTitle(mDeviceName);
		getActionBar().setDisplayHomeAsUpEnabled(true);
		Intent gattServiceIntent = new Intent(this, BluetoothLeService.class);
		bindService(gattServiceIntent, mServiceConnection, BIND_AUTO_CREATE);
	}

	@Override
	public void onBackPressed() {
		// TODO Auto-generated method stub
		super.onBackPressed();
	}

	@Override
	protected void onResume() {
		wl.acquire();// ��Ļ����
		super.onResume();
		registerReceiver(mGattUpdateReceiver, makeGattUpdateIntentFilter());
		if (mBluetoothLeService != null) {
			final boolean result = mBluetoothLeService.connect(mDeviceAddress);
			Log.d(TAG, "Connect request result=" + result);
		}
	}

	@Override
	protected void onPause() {

		wl.release(); // �ر���Ļ����
		super.onPause();

	}

	@Override
	protected void onDestroy() {
		super.onDestroy();
		unregisterReceiver(mGattUpdateReceiver);
		unbindService(mServiceConnection);
		mBluetoothLeService = null;
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		getMenuInflater().inflate(R.menu.gatt_services, menu);
		if (mConnected) {
			menu.findItem(R.id.menu_connect).setVisible(false);
			menu.findItem(R.id.menu_disconnect).setVisible(true);
		} else {
			menu.findItem(R.id.menu_connect).setVisible(true);
			menu.findItem(R.id.menu_disconnect).setVisible(false);
		}
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		switch (item.getItemId()) {
		case R.id.menu_connect:
			mBluetoothLeService.connect(mDeviceAddress);
			return true;
		case R.id.menu_disconnect:
			mBluetoothLeService.disconnect();
			return true;
		case android.R.id.home:
			onBackPressed();
			return true;
		}
		return super.onOptionsItemSelected(item);
	}

	private void updateConnectionState(final int resourceId) {
		runOnUiThread(new Runnable() {
			@Override
			public void run() {
				mConnectionState.setText(resourceId);
			}
		});
	}

	// Demonstrates how to iterate through the supported GATT
	// Services/Characteristics.
	// In this sample, we populate the data structure that is bound to the
	// ExpandableListView
	// on the UI.
	private void displayGattServices(List<BluetoothGattService> gattServices) {
		if (gattServices == null)
			return;
		String uuid = null;
		String unknownServiceString = getResources().getString(R.string.unknown_service);
		String unknownCharaString = getResources().getString(R.string.unknown_characteristic);
		ArrayList<HashMap<String, String>> gattServiceData = new ArrayList<HashMap<String, String>>();
		ArrayList<ArrayList<HashMap<String, String>>> gattCharacteristicData = new ArrayList<ArrayList<HashMap<String, String>>>();
		mGattCharacteristics = new ArrayList<ArrayList<BluetoothGattCharacteristic>>();
		// System.out.println("-----���ַ������=" + gattServices.size());
		// Loops through available GATT Services.
		for (BluetoothGattService gattService : gattServices) {
			HashMap<String, String> currentServiceData = new HashMap<String, String>();
			uuid = gattService.getUuid().toString();
			System.out.println("-----���ַ���=" + uuid);
			currentServiceData.put(LIST_NAME, SampleGattAttributes.lookup(uuid, unknownServiceString));
			currentServiceData.put(LIST_UUID, uuid);
			gattServiceData.add(currentServiceData);

			ArrayList<HashMap<String, String>> gattCharacteristicGroupData = new ArrayList<HashMap<String, String>>();
			List<BluetoothGattCharacteristic> gattCharacteristics = gattService.getCharacteristics();
			ArrayList<BluetoothGattCharacteristic> charas = new ArrayList<BluetoothGattCharacteristic>();

			// Loops through available Characteristics.
			for (BluetoothGattCharacteristic gattCharacteristic : gattCharacteristics) {
				charas.add(gattCharacteristic);
				HashMap<String, String> currentCharaData = new HashMap<String, String>();
				uuid = gattCharacteristic.getUuid().toString();
				System.out.println("          -----��������ֵ=" + uuid);
				currentCharaData.put(LIST_NAME, SampleGattAttributes.lookup(uuid, unknownCharaString));
				currentCharaData.put(LIST_UUID, uuid);
				gattCharacteristicGroupData.add(currentCharaData);

				List<BluetoothGattDescriptor> descriptorList = gattCharacteristic.getDescriptors();
				for (BluetoothGattDescriptor descriptor : descriptorList) {
					System.out.println("                    -----��������=" + descriptor.getUuid());
				}

			}
			mGattCharacteristics.add(charas);
			gattCharacteristicData.add(gattCharacteristicGroupData);
		}

		SimpleExpandableListAdapter gattServiceAdapter = new SimpleExpandableListAdapter(this, gattServiceData, android.R.layout.simple_expandable_list_item_2, new String[] { LIST_NAME, LIST_UUID }, new int[] { android.R.id.text1, android.R.id.text2 }, gattCharacteristicData, android.R.layout.simple_expandable_list_item_2, new String[] { LIST_NAME, LIST_UUID }, new int[] { android.R.id.text1, android.R.id.text2 });
//		mGattServicesList.setAdapter(gattServiceAdapter);
	}

	private static IntentFilter makeGattUpdateIntentFilter() {
		final IntentFilter intentFilter = new IntentFilter();
		intentFilter.addAction(BluetoothLeService.ACTION_GATT_CONNECTED);
		intentFilter.addAction(BluetoothLeService.ACTION_GATT_DISCONNECTED);
		intentFilter.addAction(BluetoothLeService.ACTION_GATT_SERVICES_DISCOVERED);
		intentFilter.addAction(BluetoothLeService.ACTION_DATA_AVAILABLE);
		//
		intentFilter.addAction(BluetoothLeService.READ_DEV_AlarmClock);
		intentFilter.addAction(BluetoothLeService.READ_DEV_Battery);
		intentFilter.addAction(BluetoothLeService.READ_DEV_CurrentDate);
		intentFilter.addAction(BluetoothLeService.READ_DEV_CurrentSportData);
		intentFilter.addAction(BluetoothLeService.READ_DEV_HistoryData);
		intentFilter.addAction(BluetoothLeService.READ_DEV_Mac_Serial);
		intentFilter.addAction(BluetoothLeService.READ_DEV_PersonalInfo);
		intentFilter.addAction(BluetoothLeService.READ_DEV_Version);
		intentFilter.addAction(BluetoothLeService.READ_DEV_OPERATION);

		intentFilter.addAction("android.provider.Telephony.SMS_RECEIVED");// ��������
		// intentFilter.addAction("android.intent.action.NEW_OUTGOING_CALL");//��������
		intentFilter.addAction(TelephonyManager.ACTION_PHONE_STATE_CHANGED);// ��������

		return intentFilter;
	}

	@Override
	public void onClick(View v) {
		// TODO Auto-generated method stub
		switch (v.getId()) {
//		case R.id.textView_rec:
//		case R.id.button_CMD_Control:// ��ʾ�������
//			if (relativeLayout_CMD.getVisibility() == View.VISIBLE) {
//				relativeLayout_CMD.setVisibility(View.GONE);
////				receiveTextViewShow.setVisibility(View.VISIBLE);
//			} else {
////				receiveTextViewShow.setVisibility(View.GONE);
//				relativeLayout_CMD.setVisibility(View.VISIBLE);
//			}
//			break;
		case R.id.button11:// Ӳ����Ϣ
			mBluetoothLeService.readDevHardInfo();

			break;
		case R.id.button12:// ����֪ͨ��0,ȡ�����ѣ�1���磬2���ţ�10Ѱ���ֻ�
			// mBluetoothLeService.devOpCode = 10;
			// mBluetoothLeService.devOperation.writerAlert((byte) 0x01);
			// ============================
			AlertDialog.Builder alert_Builder = new AlertDialog.Builder(DeviceControlActivity.this);
			alert_Builder.setTitle(getResources().getString(R.string.btn_writenotice));
			alert_Builder.setItems(new String[] { "0", "1", "2", "3", "10" }, new DialogInterface.OnClickListener() {
				@Override
				public void onClick(DialogInterface dialog, int which) {
					// TODO Auto-generated method stub
					if (which == 4) {
						which = 10;
					}
					mBluetoothLeService.devOpCode = 10;
					mBluetoothLeService.devOperation.writerAlert((byte) which);
				}
			});
			alert_Builder.show();
			break;
		case R.id.button13:// ��ȡ�ͣ��������к�
			mBluetoothLeService.devOpCode = 1;
			mBluetoothLeService.devOperation.readMAC_SN();
			break;
		case R.id.button14:// ��ȡ�汾��
			mBluetoothLeService.readDevSoftInfo();
			break;

		case R.id.button21:// д��ʱ��
			mBluetoothLeService.devOperation.writeDate_Time();
			mBluetoothLeService.devOpCode = 8;
			break;
		case R.id.button22:// д�������Ϣ
			AlertDialog.Builder personInfoBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
			personInfoBuilder.setTitle(getResources().getString(R.string.tip_personalInfo));
			personInfoBuilder.setItems(new String[] { getResources().getString(R.string.tip_personalType1), getResources().getString(R.string.tip_personalType2), getResources().getString(R.string.tip_personalType3), getResources().getString(R.string.tip_personalType4), getResources().getString(R.string.tip_personalType5), getResources().getString(R.string.tip_personalType6), getResources().getString(R.string.tip_personalType7), getResources().getString(R.string.tip_personalType8), getResources().getString(R.string.tip_personalType9), getResources().getString(R.string.tip_personalType10) }, new DialogInterface.OnClickListener() {

				@Override
				public void onClick(DialogInterface dialog, int which) {
					// TODO Auto-generated method stub

					switch (which) {
					case 0:// 01 ������Ϣ�����/����/�Ա�/���䣩
//						showPersonInfoDialog1();
						break;
					case 1:// 02 ��������
						showPersonInfoDialog2();
						break;
					case 2:// 03 Ŀ�경��
						showPersonInfoDialog3();
						break;
					case 3:// 04 ˯��ʱ��
//						showPersonInfoDialog4();
						break;
					case 4:// 05��������(�����������ѣ�ʱ����ʽ��ʱ��գ�)
//						showPersonInfoDialog5();
						break;
					case 5:// 06��������
//						showPersonInfoDialog6();
						break;
					case 6:// 07 ���� ����ѡ��
						showPersonInfoDialog7();
						break;
					case 7:// 08 ��Ļˮƽ��ת
						showPersonInfoDialog8();
						break;
					case 8:// 09 ̧����������
						showPersonInfoDialog9();
						break;
					// case 9:// 0A��Ϣ�� ��/�ر�
					// // showPersonInfoDialog6();
					// break;
					case 9:// ��ʱģʽ����
						showPersonInfoDialog11();
						break;

					default:
						break;
					}
				}
			});
			personInfoBuilder.show();

			break;
		case R.id.button23:// ��ȡʱ��
			mBluetoothLeService.devOpCode = 5;
			mBluetoothLeService.devOperation.readDate_Time();
			break;
		case R.id.button24:// ��ȡ������Ϣ
			AlertDialog.Builder personInfo_ReadBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
			personInfo_ReadBuilder.setTitle(getResources().getString(R.string.tip_personalInfo));
			personInfo_ReadBuilder.setItems(new String[] { getResources().getString(R.string.tip_personalType1), getResources().getString(R.string.tip_personalType2), getResources().getString(R.string.tip_personalType3), getResources().getString(R.string.tip_personalType4), getResources().getString(R.string.tip_personalType5), getResources().getString(R.string.tip_personalType6), getResources().getString(R.string.tip_personalType7), getResources().getString(R.string.tip_personalType8), getResources().getString(R.string.tip_personalType9), getResources().getString(R.string.tip_personalType10) }, new DialogInterface.OnClickListener() {

				@Override
				public void onClick(DialogInterface dialog, int which) {
					// TODO Auto-generated method stub
					mBluetoothLeService.devOpCode = 7;
					if (which == 9) {
						which = 10;
					}
					mBluetoothLeService.personalInfo_Type = which + 1;
					mBluetoothLeService.devOperation.readPersonalInfo((byte) mBluetoothLeService.personalInfo_Type);
				}
			});
			personInfo_ReadBuilder.show();

			break;
		case R.id.button31:// д������,һ��8��
//			showAlarmClockDialog();
			break;
		case R.id.button32:// ��ȡ����

			AlertDialog.Builder alarmClock_ReadBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
			alarmClock_ReadBuilder.setTitle(getResources().getString(R.string.tip_alarmClock));
			alarmClock_ReadBuilder.setItems(new String[] { "0", "1", "2", "3", "4", "5", "6", "7" }, new DialogInterface.OnClickListener() {

				@Override
				public void onClick(DialogInterface dialog, int which) {
					// TODO Auto-generated method stub
					mBluetoothLeService.devOpCode = 6;
					mBluetoothLeService.devOperation.readAlarmClock((byte) which);
				}
			});
			alarmClock_ReadBuilder.show();

			break;
		case R.id.button33:// ��ȡ����
			mBluetoothLeService.readDevBatteryInfo();
			break;
		case R.id.button34:// ��ȡ��ǰ�˶�����
			mBluetoothLeService.devOpCode = 2;
			mBluetoothLeService.devOperation.readCurrentValue();
			break;

		case R.id.button51:// ��ʷ����
			mBluetoothLeService.devOpCode = 51;
			mBluetoothLeService.devOperation.readHistoryRecodeDate();
			break;
		case R.id.button52:// ��ʷ����
			mBluetoothLeService.devOpCode = 52;
			mBluetoothLeService.devOperation.readHistoryRecodeDatail((byte) 0x01, (byte) 0x00);
			break;
		case R.id.button53:// �豸��λ
			AlertDialog.Builder resetDevBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
			resetDevBuilder.setTitle(getResources().getString(R.string.tip_resetTypeTitle));
			resetDevBuilder.setItems(new String[] { getResources().getString(R.string.tip_resetType1), getResources().getString(R.string.tip_resetType2), getResources().getString(R.string.tip_resetType3) }, new DialogInterface.OnClickListener() {

				@Override
				public void onClick(DialogInterface dialog, int which) {
					// TODO Auto-generated method stub
					// System.out.println(which);
					mBluetoothLeService.resetDev_Normal(which + 1);
				}
			});
			resetDevBuilder.show();

			break;
		case R.id.button41:// ����ѡ��

			AlertDialog.Builder menuBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
			menuBuilder.setTitle(getResources().getString(R.string.btn_Menu));
			menuBuilder.setItems(new String[] { getResources().getString(R.string.btn_showMenu), getResources().getString(R.string.btn_DownFirmware), getResources().getString(R.string.btn_ClearOutPut) }, new DialogInterface.OnClickListener() {

				@Override
				public void onClick(DialogInterface dialog, int which) {
					// TODO Auto-generated method stub
					// System.out.println(which);
					switch (which) {
					case 0:
						if (devOperationLayout.getVisibility() == View.GONE) {
							devOperationLayout.setVisibility(View.VISIBLE);
						} else {
							devOperationLayout.setVisibility(View.GONE);
						}
						break;
					case 1:
						try {
//							showDownFirmware();
						} catch (Exception e) {
							// TODO: handle exception
						}

						break;
					case 2:
						// ����
//						receiveTextViewAll.setText("");
						break;

					default:
						break;
					}
				}
			});

			menuBuilder.show();

			break;
		case R.id.button42:// ����
//			AlertDialog.Builder helpUpgradeBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
//			helpUpgradeBuilder.setTitle(getResources().getString(R.string.menu_help));
//
//			String helpString = getResources().getString(R.string.menu_help_tip);
//			helpString = helpString.replace("-filePath-", FILEDIR_STRING);
//			helpUpgradeBuilder.setMessage(helpString);
//			helpUpgradeBuilder.setPositiveButton(getResources().getString(R.string.btn_sure), null);
//			helpUpgradeBuilder.show();
			break;
		case R.id.button43:// ������λ
			AlertDialog.Builder resetUpgradeBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
			resetUpgradeBuilder.setTitle(getResources().getString(R.string.tip_resetTypeTitle));
			resetUpgradeBuilder.setItems(new String[] { "X6", "X6C", "X6S" }, new DialogInterface.OnClickListener() {

				@Override
				public void onClick(DialogInterface dialog, int which) {
					// TODO Auto-generated method stub
					// System.out.println(which);
					if (mDeviceName.toLowerCase().contains("dfu")) {// ����ģʽ�¸�λ
						mBluetoothLeService.resetDev_Upgrading();
					} else {
						mBluetoothLeService.resetDev_Upgrade(which);
					}
				}
			});

			resetUpgradeBuilder.show();

			break;
		case R.id.button44:// �̼�����(ѡ���ļ�)
			if (mConnected) {
				if (isDiscoverService) {// ����Ѿ�discoverServcice
					AlertDialog.Builder modeUpgradeBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
					modeUpgradeBuilder.setItems(new String[] { getResources().getString(R.string.upgrade_type_normal)/*, getResources().getString(R.string.upgrade_type_reliable)*/ }, new DialogInterface.OnClickListener() {

						@Override
						public void onClick(DialogInterface dialog, int which) {
							// TODO Auto-generated method stub
							// System.out.println(which);
							switch (which) {
							case 0:
								BluetoothLeService.dfu_IsSteadyUpgrade = false;// ��ͨ����ģʽ
//								showFileChooser();
								getFile(filePath);
								break;
//							case 1:
////								BluetoothLeService.dfu_IsSteadyUpgrade = true;// �ȶ�����ģʽ
////								Intent intent1 = new Intent(DeviceControlActivity.this, SelectFileActivity.class);
////								startActivityForResult(intent1, 10);// ����intent����Ҫ�󷵻ص��ý��
//								break;
							default:
								break;
							}
						}
					});
					modeUpgradeBuilder.show();
				} else {
					Toast.makeText(DeviceControlActivity.this, getResources().getString(R.string.upgrade_ble_not_inited), Toast.LENGTH_SHORT).show();
				}
			} else {
				Toast.makeText(DeviceControlActivity.this, getResources().getString(R.string.disconnected), Toast.LENGTH_SHORT).show();
			}

			// Intent intent1 = new Intent(DeviceControlActivity.this,
			// SelectFileActivity.class);
			// startActivityForResult(intent1, 10);// ����intent����Ҫ�󷵻ص��ý��
			break;

		case R.id.button61:// ����֪ͨ��ʼ
			// mBluetoothLeService.devOperation.writerNotification((byte) 0,
			// (byte) 4);
			// mBluetoothLeService.devOperation.writerNotification((byte) 1,
			// (byte) 1);

			AlertDialog.Builder notifySMSBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
			notifySMSBuilder.setTitle(getResources().getString(R.string.btn_sendMsg));
			notifySMSBuilder.setItems(new String[] { getResources().getString(R.string.tip_notifyType1), getResources().getString(R.string.tip_notifyType2), getResources().getString(R.string.tip_notifyType3) }, new DialogInterface.OnClickListener() {

				@Override
				public void onClick(DialogInterface dialog, int which) {
					// TODO Auto-generated method stub
					sendNotifyID = which;
					switch (which) {
					case 0:// ����
						mBluetoothLeService.devOpCode = 500;
						mBluetoothLeService.devOperation.writerNotification((byte) 1, (byte) 1);
						break;
					case 1:// δ������
						mBluetoothLeService.devOpCode = 500;
						mBluetoothLeService.devOperation.writerNotification((byte) 1, (byte) 2);
						break;
					case 2:// ������Ϣ
						mBluetoothLeService.devOpCode = 500;
						mBluetoothLeService.devOperation.writerNotification((byte) 0, (byte) 4);
						break;
					default:
						break;
					}
				}
			});
			notifySMSBuilder.show();

			break;

		case R.id.button62:// ����֪ͨ����
			switch (sendNotifyID) {
			case 0:
				mBluetoothLeService.devOperation.sendNotificationData("Name or number", "", "packageName");
				break;
			case 1:
				mBluetoothLeService.devOperation.sendNotificationData("Missed call name or number", "", "packageName");
				break;
			case 2:
				mBluetoothLeService.devOperation.sendNotificationData("Title:", "Message Content", "packageName");
				break;

			default:
				break;
			}

			break;
		case R.id.button63:// ȡ����ʾ
			mBluetoothLeService.devOperation.writerNotificationCancel();
			break;
		case R.id.button64:// �ĵ�����

			if (BluetoothLeService.isUsingPower) {
				BluetoothLeService.isUsingPower = false;
				bt64.setText(getResources().getString(R.string.btn_Discharge));
			} else {
				BluetoothLeService.isUsingPower = true;
				bt64.setText(getResources().getString(R.string.btn_DischargeOver));
				mBluetoothLeService.devOperation.writerNotification((byte) 1, (byte) 1);
				usingPower();
			}

			break;

		default:
			break;
		}
	}

	private void showFileChooser() {
		// ϵͳ�ļ�ѡ����
		// Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
		// intent.setType("*/*");
		// intent.addCategory(Intent.CATEGORY_OPENABLE);
		// try {
		// startActivityForResult(Intent.createChooser(intent, "��ѡ��һ��Ҫ�ϴ����ļ�"),
		// 10);
		// } catch (android.content.ActivityNotFoundException ex) {
		// // Potentially direct the user to the Market with a Dialog
		// Toast.makeText(DeviceControlActivity.this, "�밲װ�ļ�������",
		// Toast.LENGTH_SHORT).show();
		// }

//		Intent intent = new Intent(DeviceControlActivity.this, SelectFileActivity.class);
//		startActivityForResult(intent, 10);
	}

	private void usingPower() {
		mHandler.postDelayed(new Runnable() {
			@Override
			public void run() {
				// TODO Auto-generated method stub
				// mBluetoothLeService.devOperation.writerNotification((byte) 1,
				// (byte) 1);
				mBluetoothLeService.devOperation.writerAlert((byte) 3);
				if (BluetoothLeService.isUsingPower) {// ������ںĵ�
					usingPower();
				}
			}
		}, 3000);
	}

//	private void showDownFirmware() {
//		AlertDialog.Builder resetUpgradeBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
//		resetUpgradeBuilder.setTitle(getResources().getString(R.string.btn_DownFirmware));
//		resetUpgradeBuilder.setItems(new String[] { "X6", "X6C", "X6S" }, new DialogInterface.OnClickListener() {
//
//			@Override
//			public void onClick(DialogInterface dialog, int which) {
//				// TODO Auto-generated method stub
//				// http://www.vidonn.com/User/GetNewFirmware.aspx?SmartBandType=X6
//				String url = "http://www.vidonn.com/User/GetNewFirmware.aspx?SmartBandType=";
//				String firmwareName = null;
//
//				switch (which) {
//				case 0:
//					firmwareName = "x6";
//					break;
//				case 1:
//					firmwareName = "x6c";
//					break;
//				case 2:
//					firmwareName = "x6s";
//					break;
//
//				default:
//					break;
//				}
//				if (firmwareName == null) {
//					return;
//				}
//				url = url + firmwareName;
//
//				int[] date = getCurrentTime();
//				firmwareName = firmwareName + "_" + date[0] + "" + date[1] + "" + date[2] + ".bin";
//				String pathString = "/" + FILEDIR_STRING + "/firmware/cache/" + firmwareName;
//				final String fString = pathString;
//				File dirFile;
//				if (hasSDCard()) {// ����SD��
//					dirFile = new File(Environment.getExternalStorageDirectory() + pathString);
//				} else {// ������SD����д������ڴ�
//					dirFile = new File(getCacheDir().getAbsolutePath() + pathString);
//				}
//				// System.out.println("url=" + url);
//				Netroid.addFileDownload(dirFile.toString(), url, new Listener<Void>() {
//					@Override
//					public void onSuccess(Void arg0) {
//						// TODO Auto-generated method stub
//						Toast.makeText(DeviceControlActivity.this, getResources().getString(R.string.btn_DownFirmware_OK) + fString, Toast.LENGTH_LONG).show();
//						mHandler.obtainMessage(0, getResources().getString(R.string.btn_DownFirmware_OK) + fString).sendToTarget();
//					}
//
//					@Override
//					public void onError(NetroidError error) {
//						// TODO Auto-generated method stub
//						super.onError(error);
//						Toast.makeText(DeviceControlActivity.this, getResources().getString(R.string.btn_DownFirmware_Failed), Toast.LENGTH_SHORT).show();
//						mHandler.obtainMessage(0, getResources().getString(R.string.btn_DownFirmware_Failed)).sendToTarget();
//					}
//
//				});
//
//			}
//		});
//
//		resetUpgradeBuilder.show();
//	}

	public boolean hasSDCard() {
		return Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState());
	}

//	private void showAlarmClockDialog() {
//
//		final EditText alarmclock_ID, alarmclock_Hour, alarmclock_Minute;
//		final Switch alarmClockTypeSwitch;
//		final CheckBox checkBox1, checkBox2, checkBox3, checkBox4, checkBox5, checkBox6, checkBox7, checkBoxEnable;
//
//		View view = (View) getLayoutInflater().inflate(R.layout.alarmclocksetting, null); // ��ʽҳ��
//
//		checkBox1 = (CheckBox) view.findViewById(R.id.checkBox_1);
//		checkBox2 = (CheckBox) view.findViewById(R.id.checkBox_2);
//		checkBox3 = (CheckBox) view.findViewById(R.id.checkBox_3);
//		checkBox4 = (CheckBox) view.findViewById(R.id.checkBox_4);
//		checkBox5 = (CheckBox) view.findViewById(R.id.checkBox_5);
//		checkBox6 = (CheckBox) view.findViewById(R.id.checkBox_6);
//		checkBox7 = (CheckBox) view.findViewById(R.id.checkBox_7);
//
//		checkBoxEnable = (CheckBox) view.findViewById(R.id.checkBox_enable);
//		alarmClockTypeSwitch = (Switch) view.findViewById(R.id.switch_alarmClockType);
//
//		alarmclock_ID = (EditText) view.findViewById(R.id.editTextalarm_ID);
//		alarmclock_Hour = (EditText) view.findViewById(R.id.editText_hour);
//		alarmclock_Minute = (EditText) view.findViewById(R.id.editText_minute);
//
//		AlertDialog.Builder alarmClockBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
//		alarmClockBuilder.setTitle(getResources().getString(R.string.tip_personalInfo));
//		alarmClockBuilder.setView(view);
//		alarmClockBuilder.setNegativeButton(getResources().getString(R.string.btn_cancel), null);
//		alarmClockBuilder.setPositiveButton(getResources().getString(R.string.btn_sure), new DialogInterface.OnClickListener() {
//			@Override
//			public void onClick(DialogInterface dialog, int which) {
//				// TODO Auto-generated method stub
//				int enable = 0, type = 0;
//				int week1 = 0, week2 = 0, week3 = 0, week4 = 0, week5 = 0, week6 = 0, week7 = 0;
//
//				if (checkBox1.isChecked()) {
//					week1 = 1;
//				}
//				if (checkBox2.isChecked()) {
//					week2 = 1;
//				}
//				if (checkBox3.isChecked()) {
//					week3 = 1;
//				}
//				if (checkBox4.isChecked()) {
//					week4 = 1;
//				}
//				if (checkBox5.isChecked()) {
//					week5 = 1;
//				}
//				if (checkBox6.isChecked()) {
//					week6 = 1;
//				}
//				if (checkBox7.isChecked()) {
//					week7 = 1;
//				}
//				if (checkBoxEnable.isChecked()) {
//					enable = 1;
//				}
//
//				if (alarmClockTypeSwitch.isChecked()) {
//					type = 1;
//				}
//
//				byte[] alarmClockData = new byte[6];
//
//				int id = Integer.parseInt(alarmclock_ID.getText().toString());
//				int hour = Integer.parseInt(alarmclock_Hour.getText().toString());
//				int minute = Integer.parseInt(alarmclock_Minute.getText().toString());
//				if ((id > 7) || (id < 0)) {
//					id = 0;
//				}
//
//				alarmClockData[0] = (byte) id;// ���ӱ��0~7
//				alarmClockData[1] = (byte) type;// ��������
//				alarmClockData[2] = (byte) (DevOperation_X6.weekTransform(enable, week7, week1, week2, week3, week4, week5, week6));// ����_����
//				alarmClockData[3] = (byte) hour;// Сʱ
//				alarmClockData[4] = (byte) minute;// ����
//				alarmClockData[5] = (byte) 0;// ��������,ʱ�䵥λ�����ӣ�
//
//				mBluetoothLeService.devOpCode = 10;
//				mBluetoothLeService.devOperation.writeAlarmClock(alarmClockData);
//
//			}
//		});
//		alarmClockBuilder.show();
//	}

//	private void showPersonInfoDialog1() {
//		// System.out.println("д�������Ϣ1");
//		final EditText editText_hight, editText_weight, editText_age, editText_sex;
//		View view = (View) getLayoutInflater().inflate(R.layout.personinfo_1, null); // ��ʽҳ��
//		editText_hight = (EditText) view.findViewById(R.id.editText_personinfo_hight);
//		editText_weight = (EditText) view.findViewById(R.id.editText_personinfo_weight);
//		editText_age = (EditText) view.findViewById(R.id.editText_personinfo_age);
//		editText_sex = (EditText) view.findViewById(R.id.editText_personinfo_sex);
//
//		AlertDialog.Builder personInfoBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
//		personInfoBuilder.setTitle(getResources().getString(R.string.tip_personalInfo));
//		personInfoBuilder.setView(view);
//		personInfoBuilder.setNegativeButton(getResources().getString(R.string.btn_cancel), null);
//		personInfoBuilder.setPositiveButton(getResources().getString(R.string.btn_sure), new DialogInterface.OnClickListener() {
//			@Override
//			public void onClick(DialogInterface dialog, int which) {
//				// TODO Auto-generated method stub
//
//				int hight = 175, weight = 70, age = 22, sex = 0;
//				try {
//					hight = Integer.parseInt(editText_hight.getText().toString());
//					weight = Integer.parseInt(editText_weight.getText().toString());
//					age = Integer.parseInt(editText_age.getText().toString());
//					sex = Integer.parseInt(editText_sex.getText().toString());
//
//					// System.out.println("д�������Ϣ2");
//					byte[] data1 = new byte[] { (byte) hight, (byte) weight, (byte) sex, (byte) age };
//					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x01, data1);
//				} catch (Exception e) {
//					// TODO: handle exception
//					System.out.println("�����쳣");
//				}
//
//			}
//		});
//		personInfoBuilder.show();
//	}

	private void showPersonInfoDialog2() {

		final EditText editText_Sedentary = new EditText(this);
		editText_Sedentary.setInputType(InputType.TYPE_CLASS_NUMBER);
		editText_Sedentary.setHint("S,0 is close");
		editText_Sedentary.setText("3600");
		AlertDialog.Builder personInfoBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
		personInfoBuilder.setTitle(getResources().getString(R.string.tip_personalType2));
		personInfoBuilder.setView(editText_Sedentary);
		personInfoBuilder.setNegativeButton(getResources().getString(R.string.btn_cancel), null);
		personInfoBuilder.setPositiveButton(getResources().getString(R.string.btn_sure), new DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {
				// TODO Auto-generated method stub
				int sedentary = 3600;
				try {
					sedentary = Integer.parseInt(editText_Sedentary.getText().toString());

					byte[] data1 = mBluetoothLeService.devOperation.int2Bytes_2Bytes(sedentary);
					data1 = mBluetoothLeService.devDecode.switchBytes(data1);
					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x02, data1);
				} catch (Exception e) {
					// TODO: handle exception
					System.out.println("�����쳣");
				}

			}
		});
		personInfoBuilder.show();
	}

	private void showPersonInfoDialog3() {

		final EditText editText_Target = new EditText(this);
		editText_Target.setInputType(InputType.TYPE_CLASS_NUMBER);
		editText_Target.setText("10000");
		AlertDialog.Builder personInfoBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
		personInfoBuilder.setTitle(getResources().getString(R.string.tip_personalType3));
		personInfoBuilder.setView(editText_Target);
		personInfoBuilder.setNegativeButton(getResources().getString(R.string.btn_cancel), null);
		personInfoBuilder.setPositiveButton(getResources().getString(R.string.btn_sure), new DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {
				// TODO Auto-generated method stub
				int target = 10000;
				try {
					target = Integer.parseInt(editText_Target.getText().toString());

					byte[] data1 = mBluetoothLeService.devOperation.int2Bytes_4Bytes(target);
					data1 = mBluetoothLeService.devDecode.switchBytes(data1);
					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x03, data1);
				} catch (Exception e) {
					// TODO: handle exception
					System.out.println("�����쳣");
				}

			}
		});
		personInfoBuilder.show();
	}

//	private void showPersonInfoDialog4() {
//
//		final EditText editText_StartTime_H, editText_StartTime_M, editText_EndTime_H, editText_EndTime_M;
//		final Switch enableSwitch;
//		View view = (View) getLayoutInflater().inflate(R.layout.personinfo_4, null); // ��ʽҳ��
//		enableSwitch = (Switch) view.findViewById(R.id.switch_personinfo_SlientTime);
//		enableSwitch.setVisibility(View.GONE);
//		editText_StartTime_H = (EditText) view.findViewById(R.id.editText_personinfo_SleepTime_Start_H);
//		editText_StartTime_M = (EditText) view.findViewById(R.id.editText_personinfo_SleepTime_Start_M);
//		editText_EndTime_H = (EditText) view.findViewById(R.id.editText_personinfo_SleepTime_End_H);
//		editText_EndTime_M = (EditText) view.findViewById(R.id.editText_personinfo_SleepTime_End_M);
//
//		AlertDialog.Builder personInfoBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
//		personInfoBuilder.setTitle(getResources().getString(R.string.tip_personalInfo));
//		personInfoBuilder.setView(view);
//		personInfoBuilder.setNegativeButton(getResources().getString(R.string.btn_cancel), null);
//		personInfoBuilder.setPositiveButton(getResources().getString(R.string.btn_sure), new DialogInterface.OnClickListener() {
//			@Override
//			public void onClick(DialogInterface dialog, int which) {
//				// TODO Auto-generated method stub
//
//				int start_H = 22, start_M = 30, end_H = 8, end_M = 0;
//				try {
//					start_H = Integer.parseInt(editText_StartTime_H.getText().toString());
//					start_M = Integer.parseInt(editText_StartTime_M.getText().toString());
//
//					end_H = Integer.parseInt(editText_EndTime_H.getText().toString());
//					end_M = Integer.parseInt(editText_EndTime_M.getText().toString());
//
//					// byte[] data4 = new byte[] { (byte) 22, (byte) 30, (byte)
//					// 9,
//					// (byte) 20 };// 22:30~9:20
//					byte[] data1 = new byte[] { (byte) start_H, (byte) start_M, (byte) end_H, (byte) end_M };
//					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x04, data1);
//				} catch (Exception e) {
//					// TODO: handle exception
//					System.out.println("�����쳣");
//				}
//
//			}
//		});
//		personInfoBuilder.show();
//	}

//	private void showPersonInfoDialog5() {
//
//		final EditText editText_UI_Type;
//		final Switch disconnectremindSwitch, timeFormatSwitch, displayDateSwitch, weekLanguagetSwitch;
//		View view = (View) getLayoutInflater().inflate(R.layout.personinfo_5, null); // ��ʽҳ��
//
//		disconnectremindSwitch = (Switch) view.findViewById(R.id.switch_personinfo_disconnect);
//		timeFormatSwitch = (Switch) view.findViewById(R.id.switch_personinfo_Time_Format);
//		displayDateSwitch = (Switch) view.findViewById(R.id.switch_personinfo_Date_Display);
//		weekLanguagetSwitch = (Switch) view.findViewById(R.id.switch_personinfo_Week_Language);
//
//		editText_UI_Type = (EditText) view.findViewById(R.id.editText_personinfo_UI_Type);
//
//		AlertDialog.Builder personInfoBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
//		personInfoBuilder.setTitle(getResources().getString(R.string.tip_personalInfo));
//		personInfoBuilder.setView(view);
//		personInfoBuilder.setNegativeButton(getResources().getString(R.string.btn_cancel), null);
//		personInfoBuilder.setPositiveButton(getResources().getString(R.string.btn_sure), new DialogInterface.OnClickListener() {
//			@Override
//			public void onClick(DialogInterface dialog, int which) {
//				// TODO Auto-generated method stub
//
//				int disconnect = 0, timeformat = 0, displayDate = 0, weekLanguage = 0, uiType = 1;
//				if (disconnectremindSwitch.isChecked()) {
//					disconnect = 1;
//				}
//				if (timeFormatSwitch.isChecked()) {
//					timeformat = 1;
//				}
//
//				if (displayDateSwitch.isChecked()) {
//					displayDate = 1;
//				}
//				if (weekLanguagetSwitch.isChecked()) {
//					weekLanguage = 1;
//				}
//
//				byte numType = (byte) 0x00;
//
//				numType = (byte) (numType | (displayDate << 7));
//				numType = (byte) (numType | (weekLanguage << 6));
//
//				try {
//					uiType = Integer.parseInt(editText_UI_Type.getText().toString());
//					numType = (byte) (numType | uiType);
//
//					byte[] data1 = new byte[] { (byte) disconnect, (byte) timeformat, (byte) numType };
//
//					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x05, data1);
//				} catch (Exception e) {
//					// TODO: handle exception
//					System.out.println("�����쳣");
//				}
//
//			}
//		});
//		personInfoBuilder.show();
//	}

//	private void showPersonInfoDialog6() {
//
//		final EditText editText_StartTime_H, editText_StartTime_M, editText_EndTime_H, editText_EndTime_M;
//		final Switch enableSwitch;
//		View view = (View) getLayoutInflater().inflate(R.layout.personinfo_4, null); // ��ʽҳ��
//		enableSwitch = (Switch) view.findViewById(R.id.switch_personinfo_SlientTime);
//		editText_StartTime_H = (EditText) view.findViewById(R.id.editText_personinfo_SleepTime_Start_H);
//		editText_StartTime_M = (EditText) view.findViewById(R.id.editText_personinfo_SleepTime_Start_M);
//		editText_EndTime_H = (EditText) view.findViewById(R.id.editText_personinfo_SleepTime_End_H);
//		editText_EndTime_M = (EditText) view.findViewById(R.id.editText_personinfo_SleepTime_End_M);
//
//		AlertDialog.Builder personInfoBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
//		personInfoBuilder.setTitle(getResources().getString(R.string.tip_personalInfo));
//		personInfoBuilder.setView(view);
//		personInfoBuilder.setNegativeButton(getResources().getString(R.string.btn_cancel), null);
//		personInfoBuilder.setPositiveButton(getResources().getString(R.string.btn_sure), new DialogInterface.OnClickListener() {
//			@Override
//			public void onClick(DialogInterface dialog, int which) {
//				// TODO Auto-generated method stub
//
//				int enable = 0, start_H = 22, start_M = 30, end_H = 8, end_M = 0;
//				try {
//					start_H = Integer.parseInt(editText_StartTime_H.getText().toString());
//					start_M = Integer.parseInt(editText_StartTime_M.getText().toString());
//
//					end_H = Integer.parseInt(editText_EndTime_H.getText().toString());
//					end_M = Integer.parseInt(editText_EndTime_M.getText().toString());
//
//					// byte[] data4 = new byte[] { (byte) 22, (byte) 30, (byte)
//					// 9,
//					// (byte) 20 };// 22:30~9:20
//					if (enableSwitch.isChecked()) {
//						enable = 1;
//					} else {
//						enable = 0;
//					}
//
//					byte[] data1 = new byte[] { (byte) enable, (byte) start_H, (byte) start_M, (byte) end_H, (byte) end_M };
//					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x06, data1);
//				} catch (Exception e) {
//					// TODO: handle exception
//					System.out.println("�����쳣");
//				}
//
//			}
//		});
//		personInfoBuilder.show();
//	}

	// 07���Ա���
	private void showPersonInfoDialog7() {
		AlertDialog.Builder personInfoBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
		personInfoBuilder.setTitle(getResources().getString(R.string.tip_personalType9));

		personInfoBuilder.setItems(new String[] { "CN EN JP", "Ko", "Many languages", "ISO9885" }, new DialogInterface.OnClickListener() {

			@Override
			public void onClick(DialogInterface dialog, int which) {
				// TODO Auto-generated method stub
				switch (which) {
				case 0:// ��Ӣ��
					byte[] data1 = new byte[] { (byte) 0 };
					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x07, data1);
					break;
				case 1:// ����
					byte[] data2 = new byte[] { (byte) 1 };
					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x07, data2);
					break;
				case 2:// �������
					byte[] data3 = new byte[] { (byte) 2 };
					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x07, data3);
					break;
				case 3:// ISO9885
					byte[] data4 = new byte[] { (byte) 3 };
					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x07, data4);
					break;
				default:
					break;
				}
			}
		});
		personInfoBuilder.show();
	}

	// 08 ��Ļˮƽ��ת
	private void showPersonInfoDialog8() {
		final Switch switch1 = new Switch(this);
		AlertDialog.Builder personInfoBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
		personInfoBuilder.setTitle(getResources().getString(R.string.tip_personalType8));
		personInfoBuilder.setView(switch1);
		personInfoBuilder.setNegativeButton(getResources().getString(R.string.btn_cancel), null);
		personInfoBuilder.setPositiveButton(getResources().getString(R.string.btn_sure), new DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {
				// TODO Auto-generated method stub
				int temp = 0;
				if (switch1.isChecked()) {
					temp = 1;
				} else {
					temp = 0;
				}
				byte[] data1 = new byte[] { (byte) temp };
				mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x08, data1);

			}
		});
		personInfoBuilder.show();
	}

	// 09 ̧����������
	private void showPersonInfoDialog9() {
		AlertDialog.Builder personInfoBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
		personInfoBuilder.setTitle(getResources().getString(R.string.tip_personalType9));

		personInfoBuilder.setItems(new String[] { getResources().getString(R.string.tip_personalType91), getResources().getString(R.string.tip_personalType92), getResources().getString(R.string.tip_personalType93) }, new DialogInterface.OnClickListener() {

			@Override
			public void onClick(DialogInterface dialog, int which) {
				// TODO Auto-generated method stub
				switch (which) {
				case 0:// �ر�̧������
					byte[] data1 = new byte[] { (byte) 0 };
					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x09, data1);
					break;
				case 1:// ̧������(����)
					byte[] data2 = new byte[] { (byte) 3 };
					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x09, data2);
					break;
				case 2:// ̧������(����)
					byte[] data3 = new byte[] { (byte) 1 };
					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x09, data3);
					break;
				default:
					break;
				}
			}
		});
		personInfoBuilder.show();
	}

	// 09 ̧����������
	private void showPersonInfoDialog11() {
		AlertDialog.Builder personInfoBuilder = new AlertDialog.Builder(DeviceControlActivity.this);
		personInfoBuilder.setTitle(getResources().getString(R.string.tip_personalType9));

		personInfoBuilder.setItems(new String[] { getResources().getString(R.string.tip_open), getResources().getString(R.string.tip_close) }, new DialogInterface.OnClickListener() {

			@Override
			public void onClick(DialogInterface dialog, int which) {
				// TODO Auto-generated method stub
				switch (which) {
				case 0:// ������ʱģʽ
					byte[] data1 = new byte[] { (byte) 0 };
					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x0b, data1);
					break;
				case 1:// �ر���ʱģʽ
					byte[] data2 = new byte[] { (byte) 1 };
					mBluetoothLeService.devOperation.writePersonalInfo((byte) 0x0b, data2);
					break;
				default:
					break;
				}
			}
		});
		personInfoBuilder.show();
	}

	// ===================================================

//	public static void setPath(String path) {
//		// TODO Auto-generated method stub
//		filePath = path;
//	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (resultCode == RESULT_OK) {
			if (requestCode == 10) {// ѡ���ļ���������

				if ((filePath == null) || (filePath.equals(""))) {
					return;
				}
				// receiveTextView.setText("���ڹ̼�����");
				int[] time = getCurrentTime();
//				receiveTextViewAll.append("\n" + getResources().getString(R.string.tip_starttime) + ":" + time[3] + ":" + time[4] + ":" + time[5] + "\n");
				getFile(filePath);
			}
		}
		// TODO Auto-generated method stub
		super.onActivityResult(requestCode, resultCode, data);
	}

	// ���ļ���ȡ�����ļ�
	public void getFile(final String path) {

		Thread getfileThread = new Thread() {

			@Override
			public void run() {
				// TODO Auto-generated method stub
				// super.run();
				try {
					get();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			

			public void get() throws IOException {
				long length = 0;
				int size = 0;
				byte[] buffer;
				BufferedInputStream in;
				String pathName = "";
				Log.d("dklog", ">>>>> getFile");
				
				if (path == null) {
					File dirFile = new File(Environment.getExternalStorageDirectory() + "/" + FILEDIR_STRING);
					// pathName = dirFile + "/application.bin";
					pathName = dirFile + "";
				} else {
					pathName = path;
				}

/*				
				AssetManager am = getResources().getAssets();
				if(am.openFd("bang.bin") == null) {
					return;
				} else {
					mHandler.obtainMessage(20, null).sendToTarget();
				}
				InputStream is = am.open("bang.bin");
				
				length = is.available();
				buffer = new byte[is.available()];
				in = new BufferedInputStream(is);
*/				
				
				
				File f = new File(pathName);
				if (!f.exists()) {// ������
//					receiveTextViewAll.append(pathName + getResources().getString(R.string.tip_file_not_exist));
					mHandler.obtainMessage(20, null).sendToTarget();
				}
				length = f.length();
				buffer = new byte[(int) length];
				System.out.println(getResources().getString(R.string.tip_file_length) + "=" + length);
				in = new BufferedInputStream(new FileInputStream(pathName));

				
				// ��ȡ������
				while ((size = in.read(buffer)) != -1) {
					// System.out.println("��ȡ��=" + length);
				}

				StringBuilder stringBuilder = new StringBuilder();
				System.out.println("xx-" + stringBuilder.append(String.format("%02X ", buffer[(int) length - 1]).toString()));

				// System.out.println("�ļ�����=" + length + "  " +
				// byteToString(buffer));
//				receiveTextViewAll.append(getResources().getString(R.string.tip_file_length) + "=" + length);
				mHandler.obtainMessage(20, buffer).sendToTarget();
			}

		};

		getfileThread.run();

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

	/**
	 * ��ʼ������ʱ��
	 */
	public int[] getCurrentTime() {
		int[] date = new int[6];
		// ��ȡϵͳʱ��
		Calendar ca = Calendar.getInstance();
		ca.get(Calendar.HOUR_OF_DAY);// �õ�24Сʱ���Ƶ�
		// ca.get(Calendar.HOUR);// �õ�12Сʱ���Ƶ�
		date[0] = ca.get(Calendar.YEAR);// ��ȡ���
		date[1] = ca.get(Calendar.MONTH) + 1;// ��ȡ�·�,�Ǵ�0��ʼ��,+1У׼
		date[2] = ca.get(Calendar.DATE);// ��ȡ��
		date[3] = ca.get(Calendar.HOUR);// Сʱ
		date[4] = ca.get(Calendar.MINUTE);// ��
		date[5] = ca.get(Calendar.SECOND);// ��

		int ap = ca.get(Calendar.AM_PM);// ����0������1
		// int WeekOfYear = ca.get(Calendar.DAY_OF_WEEK);
		if (ap == 1) {// ��ֹ12Сʱ��
			if (date[3] < 12) {
				date[3] = date[3] + 12;
			}
		}

		return date;
	}

	@Override
	public void handlingError(String arg0, String arg1, String arg2, String arg3, NetReqOptions arg4) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void requestData(String arg0, String arg1, DataHandler arg2, NetReqOptions arg3) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void responseData(int arg0, String arg1, String arg2, String arg3, NetReqOptions arg4) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void onApplicationWillTerminate() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void onFinishedCaptureView() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void onRestoreActivity(Parameters arg0) {
		// TODO Auto-generated method stub
		
	}

	// ----------------------------------------------------------

}
