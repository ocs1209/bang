package com.uracle.wellness.firmupgrade;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Calendar;

import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.os.Environment;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.util.Log;
import m.client.library.plugin.fit.FitConstants;
import m.client.library.plugin.fit.service.WorkerThread;

public class DFUHandler {

	private static DFUHandler dfuHandler = null;
	private static WorkerThread workerThread;
	private BluetoothLeService mBluetoothLeService;
	public static String dfu_DeviceAddress;
	public static String dfu_DeviceName;
	public  android.os.Handler callerHandler;
	private boolean mConnected = false;
	private boolean isDiscoverService = false;
	private boolean isband = true;
	private boolean isDfuReady = false;
	int n = 0;
	int allcount = 0;
	private Context mContext;
	private Intent isRegister = null;
	
	private static String filePath = Environment.getExternalStorageDirectory().getAbsolutePath() + File.separator + "bang.bin";
	public DFUHandler() {
	}
	
	public static DFUHandler getInstance() {
		if(dfuHandler == null) {
			dfuHandler = new DFUHandler();
			workerThread = new WorkerThread("DFUThread");
			workerThread.start();
			workerThread.prepareHandler();
		}
		return dfuHandler;
		
	}
	
	public boolean bindDFUService(Context context, String deviceName, String deviceAddress) {
		boolean returnVal = false;
		Intent serviceIntent = new Intent(context, BluetoothLeService.class);
		Log.d("dklog", "bindDFUService 1");
		mContext = context;
		dfu_DeviceAddress = deviceAddress;
		dfu_DeviceName = deviceName;
		
		if(context.bindService(serviceIntent, mLeServiceConnection, mContext.BIND_AUTO_CREATE)) {
			returnVal = true;
			isRegister = mContext.registerReceiver(mGattUpdateReceiver, makeGattUpdateIntentFilter());
			if (isRegister == null) {
				Log.d("dklog", "<><><><><><> Not registerReceiver !!!");
			}
		}
		
		return returnVal;
	}
	
	public void unbindDFUService(Context context) {
		
		if(context == null) {
			Log.d("dklog", "unbindDFUService context = null");
			return;
		}
		
		try {
			if(mGattUpdateReceiver != null) {
				Log.d("dklog", "unbindDFUService 2");
				
				if(isRegister != null) {
					context.unregisterReceiver(mGattUpdateReceiver);
					isRegister = null;
				}
			}
			
			if(mLeServiceConnection != null) {
				Log.d("dklog", "unbindDFUService 3");
				context.unbindService(mLeServiceConnection);
			}
		}
		catch (final Exception exception) {
			Log.d("dklog", "<><><><><><><> exception = " + exception.getMessage());
		}
		
		mBluetoothLeService = null;
	}
	
	public void readyForDFU(Context context) {
		Log.d("dklog", "readyForDFU 1");
		mContext = context;
		if(mBluetoothLeService != null) {
			Log.d("dklog", "readyForDFU 2");
			mBluetoothLeService.resetDev_Upgrade(2);
		}
	}
	
	public void airUpgrade(Context context) {
		Log.d("dklog", "airUpgrade 1");
		mContext = context;
		if(mBluetoothLeService != null) {
//			mBluetoothLeService.dfu_IsDFUReset = true;
			getFile(filePath, context);
		}
	}
	
	public void reconnect(String deviceAddress, String deviceName) {
		dfu_DeviceAddress = deviceAddress;
		dfu_DeviceName = deviceName;
		
		if(mBluetoothLeService != null) {
			mBluetoothLeService.connect(dfu_DeviceAddress);
		}
	}
	
	private final ServiceConnection mLeServiceConnection = new ServiceConnection() {

		@Override
		public void onServiceConnected(ComponentName componentName, IBinder service) {
			mBluetoothLeService = ((BluetoothLeService.LocalBinder) service).getService();
			if (!mBluetoothLeService.initialize()) {
				Log.d("dklog", "Unable to initialize Bluetooth");
				return;
			}
			// Automatically connects to the device upon successful start-up
			// initialization.
			mBluetoothLeService.connect(dfu_DeviceAddress);
			mBluetoothLeService.setHandler(mHandler);
		}

		@Override
		public void onServiceDisconnected(ComponentName componentName) {
			mBluetoothLeService = null;
		}
	};
	
	Handler mHandler = new Handler() {

		@Override
		public void handleMessage(Message msg) {
			super.handleMessage(msg);
			n++;
			switch (msg.what) {

			case FitConstants.MSG_DFUHANDLER_READY:
				callerHandler.obtainMessage(FitConstants.MSG_FIT_DFU_READY, dfu_DeviceAddress).sendToTarget();
				Log.d("dklog", ">>>>> handler 777");
				break;
			case FitConstants.MSG_INITUUID_READY:
				if(!isDfuReady) {
					callerHandler.obtainMessage(FitConstants.MSG_INITUUID_READY, "").sendToTarget();	
					Log.d("dklog", ">>>>> MSG_INITUUID_READY");
					isDfuReady = true;
				}
				break;
				
			case 2:
				break;
			case 3:
				break;
			case 11:
				Log.d("dklog", ">>>>> handler 11");
				allcount = (Integer) msg.obj;
				allcount--;
				DFUTimeoutService.startTimeoutService(mContext, mHandler);
//				
//				Intent intent = new Intent(mContext, TimeoutService.class);
//		        mContext.startService(intent); 
				break;

			case 12:
				Log.d("dklog", ">>>>> handler 12");
				if (allcount == 0) {
					break;
				}

				int process = (Integer) msg.obj;

				if (allcount == process) {
					int[] time = getCurrentTime();
				}

				process = process * 100 / allcount;
				if(callerHandler != null) {
					callerHandler.obtainMessage(FitConstants.MSG_FIT_AIR_UPGRADE, String.valueOf(process)).sendToTarget();
				}
				if(process == 100) {
					Intent intent = new Intent(mContext, DFUTimeoutService.class);
			        mContext.stopService(intent); 
				} else {
					DFUTimeoutService.resetCountdown();
				}
				break;
			case 13:
				if(callerHandler != null) {
					callerHandler.obtainMessage(FitConstants.MSG_FIT_AIR_UPGRADE, "FAIL").sendToTarget();
				}
				break;
				
			case 15: // air upgrade ready
				if(callerHandler != null) {
					callerHandler.obtainMessage(FitConstants.MSG_AIR_UPGRADE_READY, "").sendToTarget();
				}
				break;

			case 20:// ��ȡ�ļ����ݷ���
				Log.d("dklog", ">>>>> handler 20");
				byte[] data_byte = (byte[]) msg.obj;
				mBluetoothLeService.airUpgrade(data_byte);
				break;
				
			case FitConstants.MSG_DFU_PERCENT_100:
				if(callerHandler != null) {
					callerHandler.obtainMessage(FitConstants.MSG_FIT_AIR_UPGRADE, "100").sendToTarget();
				}
				break;

			default:
				break;
			}
		}
	};
	
	public int[] getCurrentTime() {
		int[] date = new int[6];
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
	
	private final BroadcastReceiver mGattUpdateReceiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			final String action = intent.getAction();

//			if (action.equals("android.provider.Telephony.SMS_RECEIVED")) {// �յ�����
//				StringBuffer SMSAddress = new StringBuffer();
//				StringBuffer SMSContent = new StringBuffer();
//				Bundle bundle = intent.getExtras();
//				if (bundle != null) {
//					Object[] pdusObjects = (Object[]) bundle.get("pdus");
//					SmsMessage[] messages = new SmsMessage[pdusObjects.length];
//					for (int i = 0; i < pdusObjects.length; i++) {
//						messages[i] = SmsMessage.createFromPdu((byte[]) pdusObjects[i]);
//					}
//					for (SmsMessage message : messages) {
//						SMSAddress.append(message.getDisplayOriginatingAddress());
//						SMSContent.append(message.getDisplayMessageBody());
//					}
//				}
//
//			} else if (action.equals(TelephonyManager.ACTION_PHONE_STATE_CHANGED)) {// ������
//				TelephonyManager telephony = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
//				int state = telephony.getCallState();
//
//				String phoneNumber = intent.getStringExtra("incoming_number");
//
//				switch (state) {
//				case TelephonyManager.CALL_STATE_RINGING:
//					// Log.i(TAG, "[Broadcast]�ȴ��ӵ绰=" + phoneNumber);
//					break;
//				case TelephonyManager.CALL_STATE_IDLE:
//					// Log.i(TAG, "[Broadcast]�绰�Ҷ�=" + phoneNumber);
//					break;
//				case TelephonyManager.CALL_STATE_OFFHOOK:
//					// Log.i(TAG, "[Broadcast]ͨ����=" + phoneNumber);
//					break;
//				}
//			}

			if (BluetoothLeService.ACTION_GATT_CONNECTED.equals(action)) {
				mConnected = true;
//				updateConnectionState(R.string.connected);
//				invalidateOptionsMenu();
			} else if (BluetoothLeService.ACTION_GATT_DISCONNECTED.equals(action)) {
				isDiscoverService = false;
				mConnected = false;
//				updateConnectionState(R.string.disconnected);
//				invalidateOptionsMenu();
//				clearUI();
			} else if (BluetoothLeService.ACTION_GATT_SERVICES_DISCOVERED.equals(action)) {
				// Show all the supported services and characteristics on the
				// user interface.
				Log.d("dklog", "BluetoothLeService.ACTION_GATT_SERVICES_DISCOVERED ==> initUUID");
				isDiscoverService = true;
//				displayGattServices(mBluetoothLeService.getSupportedGattServices());
				mBluetoothLeService.inintUUID();// ��ʼ��
			} else if (BluetoothLeService.ACTION_DATA_AVAILABLE.equals(action)) {

			} else if (BluetoothLeService.READ_DEV_OPERATION.equals(action)) {
				// devOperationLayout.setVisibility(View.VISIBLE);
			}

		}
	};
	
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
		intentFilter.addAction("android.provider.Telephony.SMS_RECEIVED");
		 intentFilter.addAction("android.intent.action.NEW_OUTGOING_CALL");
//		intentFilter.addAction(TelephonyManager.ACTION_PHONE_STATE_CHANGED);

		return intentFilter;
	}
	
	public void getFile(final String path, final Context context) {

		Thread getfileThread = new Thread() {

			@Override
			public void run() {
				try {
					get();
				} catch (IOException e) {
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
//					File dirFile = new File(Environment.getExternalStorageDirectory() + "/" + FILEDIR_STRING);
					// pathName = dirFile + "/application.bin";
//					pathName = dirFile + "";
				} else {
					pathName = path;
				}

				if(context == null) {
					Log.d("dklog", ">>>>> mContext == null");
					return;
				}
//				AssetManager am = context.getResources().getAssets();
//				if(am.openFd("bang.bin") == null) {
//					return;
//				} 
				
				InputStream is = null;
				try {
					
					is = context.getAssets().open("bang.bin");
					length = is.available();
					buffer = new byte[is.available()];
					in = new BufferedInputStream(is);
					
	/*				File f = new File(pathName);
					if (!f.exists()) {// ������
//						receiveTextViewAll.append(pathName + getResources().getString(R.string.tip_file_not_exist));
						mHandler.obtainMessage(20, null).sendToTarget();
					}
					length = f.length();
					buffer = new byte[(int) length];
					in = new BufferedInputStream(new FileInputStream(pathName));
	*/
					while ((size = in.read(buffer)) != -1) {
					}

					StringBuilder stringBuilder = new StringBuilder();
					System.out.println("xx-" + stringBuilder.append(String.format("%02X ", buffer[(int) length - 1]).toString()));

					mHandler.obtainMessage(20, buffer).sendToTarget();
					is.close();
				} catch (IOException e) {
					// Handle exceptions here
				}
				
				
				
				
			}

		};

		getfileThread.run();
	}
	
	public void setHandler(android.os.Handler handler) {
		callerHandler = handler;
	}
}
