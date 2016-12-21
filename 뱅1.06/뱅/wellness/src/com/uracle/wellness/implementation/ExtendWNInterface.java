package com.uracle.wellness.implementation;

import java.util.List;

import m.client.android.library.core.bridge.InterfaceJavascript;
import m.client.android.library.core.managers.ActivityHistoryManager;
import m.client.android.library.core.utils.CommonLibUtil;
import m.client.android.library.core.utils.PLog;
import m.client.android.library.core.view.AbstractActivity;
import m.client.android.library.core.view.MainActivity;
import m.client.library.plugin.fit.FitConstants;
import m.client.library.plugin.fit.db.DatabaseManager;
import m.client.library.plugin.fit.db.SamplesInfo;
import m.client.library.plugin.fit.service.FitHandler;
import m.client.library.plugin.fit.service.NotificationListenerService;
import m.client.library.plugin.fit.service.ServiceMonitor;
import m.client.library.plugin.fit.util.BleUtils;
import m.client.library.plugin.fit.util.DBUtils;
import m.client.library.plugin.fit.util.SummaryUtil;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.AlertDialog;
import android.content.ComponentName;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Handler;
import android.os.Message;
import android.provider.Settings;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.uracle.wellness.R;
import com.uracle.wellness.firmupgrade.DFUHandler;
import com.uracle.wellness.fit.FitManager;
import com.uracle.wellness.service.SynchService;

/**
 * ExtendWNInterface Class
 * 
 * @author 류경민(<a mailto="kmryu@uracle.co.kr">kmryu@uracle.co.kr</a>)
 * @version v 1.0.0
 * @since Android 2.1 <br>
 *        <DT><B>Date: </B>
 *        <DD>2011.04</DD>
 *        <DT><B>Company: </B>
 *        <DD>Uracle Co., Ltd.</DD>
 * 
 *        사용자 정의 확장 인터페이스 구현
 * wnGetSleepSamples
 *        Copyright (c) 2011-2013 Uracle Co., Ltd. 166 Samseong-dong,
 *        Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
 */
public class ExtendWNInterface extends InterfaceJavascript {

	public static String upgradeCallback = "";
	public static String readyCallback = "";
	
	
	/**
	 * 아래 생성자 메서드는 반드시 포함되어야 한다.
	 * 
	 * @param callerObject
	 * @param webView
	 */
	public ExtendWNInterface(AbstractActivity callerObject, WebView webView) {
		super(callerObject, webView);
	}

	public Handler callbackHandler = new Handler() {

		@Override
		public void handleMessage(Message msg) {
			super.handleMessage(msg);
			final MainActivity activity = (MainActivity) ActivityHistoryManager.getInstance().getTopActivity();
			Log.d("dklog", "[ExtendWNInterface]  > : " + msg.what);
			switch (msg.what) {
			case FitConstants.MSG_FIT_DFU_READY: 
				String deviceAddress = (String) msg.obj;
//				Log.d("dklog", "[ExtendWNInterface] : deviceAddress = " + deviceAddress);
				
				String addressLast = deviceAddress.substring(deviceAddress.length()-2);
				deviceAddress = deviceAddress.substring(0, deviceAddress.length()-2);
				
				byte[] data = HexString2Bytes(addressLast);
				byte sum = (byte) ((byte) data[0] + (byte) 0x01);
				String sumData = String.format("%02X", sum);
				deviceAddress = deviceAddress + sumData;
				Log.d("dklog", "[ExtendWNInterface] : deviceAddress = " + deviceAddress.toString());
//				
				try {
					Thread.sleep(500);
				} catch (InterruptedException e1) {
					e1.printStackTrace();
				}
				
				// when page not move this code working
				DFUHandler.getInstance().unbindDFUService(callerObject);
				
				try {
					Thread.sleep(1000);
				} catch (InterruptedException e1) {
					e1.printStackTrace();
				}
				DFUHandler.getInstance().bindDFUService(callerObject, "Dfu BANG", deviceAddress);
//				DFUHandler.getInstance().reconnect(deviceAddress, "Dfu BANG");
				break;
				
			case FitConstants.MSG_FIT_AIR_UPGRADE: 
				final String status = (String) msg.obj;
//				Log.d("dklog", "[ExtendWNInterface] - MSG_FIT_AIR_UPGRADE : " + msg.what);
				
				if (status.equalsIgnoreCase("FAIL")) {
					callerObject.runOnUiThread(new Runnable() {
						@Override
						public void run() {
							try {
								JSONObject returnValue = new JSONObject();
								returnValue.put("status", "FAIL");

								activity.getWebView().loadUrl("javascript:" + upgradeCallback + "(" + returnValue.toString() + ");");
//								Log.d("dklog", "javascript:" + upgradeCallback + "(" + returnValue.toString() + ");");
							} catch (Exception e) {
								e.printStackTrace();
							}
						}
					});
					return;
				} 
				
				if (status.equalsIgnoreCase("100")) {
					try {
						Thread.sleep(1000);
//						DFUHandler.getInstance().unbindDFUService(callerObject);
						BleUtils.setStringToStorage("DEVICE_NAME", "", callerObject);
						BleUtils.setStringToStorage("DEVICE_ADDRESS", "", callerObject);
					} catch (InterruptedException e1) {
						e1.printStackTrace();
					}
				}
				
				callerObject.runOnUiThread(new Runnable() {
					@Override
					public void run() {
						try {
							JSONObject returnValue = new JSONObject();
							returnValue.put("status", "PROCESSING");
							returnValue.put("count", status);

							activity.getWebView().loadUrl("javascript:" + upgradeCallback + "(" + returnValue.toString() + ");");
							Log.d("dklog", "javascript:" + upgradeCallback + "(" + returnValue.toString() + ");");
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				});
				break;
			
			case FitConstants.MSG_INITUUID_READY:
				DFUHandler.getInstance().readyForDFU(callerObject);
				Log.d("dklog", "[ExtendWNInterface] - MSG_INITUUID_READY ");
				break;
				
			case FitConstants.MSG_AIR_UPGRADE_READY:
				Log.d("dklog", "[ExtendWNInterface] - MSG_AIR_UPGRADE_READY ");
				
					callerObject.runOnUiThread(new Runnable() {
						@Override
						public void run() {
							try {
								JSONObject returnValue = new JSONObject();
								returnValue.put("status", "SUCCESS");
								activity.getWebView().loadUrl("javascript:" + readyCallback + "(" + returnValue.toString() + ");");
								Log.d("dklog", "javascript:" + readyCallback + "(" + returnValue.toString() + ");");
							} catch (Exception e) {
								e.printStackTrace();
							}
						}
					});
				
				break;
				
			}
		}
	};
	
	/**
	 * 보안 키보드 데이터 콜백 함수 
	 * @param data 
	 */
	public void wnCBSecurityKeyboard(Intent data) {  
		// callerObject.startActivityForResult(newIntent,libactivities.ACTY_SECU_KEYBOARD);
	}
	
	////////////////////////////////////////////////////////////////////////////////
	// 사용자 정의 네이티브 확장 메서드 구현
	
	//
	// 아래에 네이티브 확장 메서드들을 구현한다.
	// 사용 예
	//
	public String exWNTestReturnString(String receivedString) {
		String newStr = "I received [" + receivedString + "]";
		return newStr;
	}
	
	/**
	 * WebViewClient의 shouldOverrideUrlLoading()을 확장한다.
	 * @param view
	 * @param url
	 * @return 
	 * 		InterfaceJavascript.URL_LOADING_RETURN_STATUS_NONE	확장 구현을하지 않고 처리를 모피어스로 넘긴다.
	 * 		InterfaceJavascript.URL_LOADING_RETURN_STATUS_TRUE	if the host application wants to leave the current WebView and handle the url itself
	 * 		InterfaceJavascript.URL_LOADING_RETURN_STATUS_FALSE	otherwise return false.
	 */
	public int extendShouldOverrideUrlLoading(WebView view, String url) {

		// Custom url schema 사용 예
//		if(url.startsWith("custom:")) {
//		    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
//		    callerObject.startActivity( intent ); 
//    		return InterfaceJavascript.URL_LOADING_RETURN_STATUS_FALSE;
//    	}
		
		return InterfaceJavascript.URL_LOADING_RETURN_STATUS_NONE;
	}
	
	/**
	 * 페이지 로딩이 시작되었을때 호출된다.
	 * @param view
	 * @param url
	 * @param favicon
	 */
	public void onExtendPageStarted (WebView view, String url, Bitmap favicon) {
		PLog.i("", ">>> 여기는 ExtendWNInterface onPageStarted입니다!!!");
	}
	
	/**
	 * 페이지 로딩이 완료되었을때 호출된다.
	 * @param view
	 * @param url
	 */
	public void onExtendPageFinished(WebView view, String url) {
		PLog.i("", ">>> 여기는 ExtendWNInterface onPageFinished!!!");
	}
	
	/**
	 * Give the host application a chance to handle the key event synchronously
	 * @param view
	 * @param event
	 * @return True if the host application wants to handle the key event itself, otherwise return false
	 */
	public boolean extendShouldOverrideKeyEvent(WebView view, KeyEvent event) {
		
		return false;
	}
	
	/**
	 * onActivityResult 발생시 호출.
	 */
	public void onExtendActivityResult(Integer requestCode, Integer resultCode, Intent data) {
		PLog.i("", ">>> 여기는 ExtendWNInterface onExtendActivityResult!!!  requestCode => [ " + requestCode + " ], resultCode => [ " + resultCode + " ]");
	}
	
	
	public void exWN2PluginFitNotificationSetting(String jsonData) {
		PLog.i("", "exWN2PluginFitNotificationSetting");
		ComponentName cn = new ComponentName(callerObject, NotificationListenerService.class);
		String flat = Settings.Secure.getString(callerObject.getContentResolver(), "enabled_notification_listeners");
		final boolean enabled = flat != null && flat.contains(cn.flattenToString());
		
		if (!enabled) {
			NotificationSettingPopUp();
		}
		else {
			Intent intent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
			callerObject.startActivity(intent);
		}
	}
	
	public void NotificationSettingPopUp() {
		AlertDialog.Builder alert = new AlertDialog.Builder(callerObject);
        alert.setPositiveButton("예", new DialogInterface.OnClickListener() {

             @Override
             public void onClick(DialogInterface dialog, int which) {
                 Intent intent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
                 callerObject.startActivity(intent);
                 dialog.dismiss();
             }
        });
        alert.setNegativeButton("아니오", new DialogInterface.OnClickListener() {

            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.cancel();
            }
       });
        
        alert.setTitle("알림 접근");
        alert.setMessage("이 기능은 전화 및 SMS, 카톡 등이 수신되는 경우, 스마트밴드를 통해 알려주는 기능입니다. 이 기능을 사용 위해서는 알림 메지시에 대한 읽기 권한을 허용해야 합니다. \n\n" + "\"예\" 를 누른 후, 설정화면에서 " + callerObject.getApplication().getString(R.string.app_name) +"을 선택하시기 바랍니다. 사용 하시겠습니까?");
        alert.setCancelable(false);
        alert.show();
  }

	
	public void exWN2PluginFitUpgrade(String jsonData) {
		
//		String deviceName = BleUtils.getStringFromStorage("DEVICE_NAME", callerObject);
//		String deviceAddress = BleUtils.getStringFromStorage("DEVICE_ADDRESS", callerObject);
/*		
		String deviceName = FitHandler.getInstance().getDeviceName();
		String deviceAddress = FitHandler.getInstance().getDeviceAddress();
		Log.d("dklog", "[ExtendWNInterface] - exWN2PluginFitUpgrade 1 deviceAddress = " + deviceAddress);
		
//		DFUHandler.getInstance().readyForDFU(callerObject);
		
		if(deviceAddress.isEmpty() || deviceAddress.length() < 10 || jsonData.isEmpty()) {
			return;
		}
		
		Log.d("dklog", "[ExtendWNInterface] - wn2PluginFitTest 2 ");
		JSONObject jsonObj;
		try {
			jsonObj = new JSONObject(jsonData);
		} catch (JSONException e1) {
			e1.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		ServiceMonitor serviceMonitor = ServiceMonitor.getInstance();
		serviceMonitor.stopMonitoring(callerObject);
		
		FitHandler.getInstance().stopFitServiceForDfu();
		
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		
		DFUHandler.getInstance().setHandler(callbackHandler);
		if (DFUHandler.getInstance().bindDFUService(callerObject, deviceName, deviceAddress)) {
//			try {
//				Thread.sleep(100);
////				
//			} catch (InterruptedException e) {
//				// TODO Auto-generated catch block
//				e.printStackTrace();
//			}
		}
	*/	
	}
	
	
	public static byte[] HexString2Bytes(String src) {
		int length = src.length() / 2;
		byte[] ret = new byte[length];
		byte[] tmp = src.getBytes();
		for (int i = 0; i < length; i++) {
			ret[i] = uniteBytes(tmp[i * 2], tmp[i * 2 + 1]);
		}
		return ret;
	}
	
	public static byte uniteBytes(byte src0, byte src1) {
		byte _b0 = Byte.decode("0x" + new String(new byte[] { src0 })).byteValue();
		_b0 = (byte) (_b0 << 4);
		byte _b1 = Byte.decode("0x" + new String(new byte[] { src1 })).byteValue();
		byte ret = (byte) (_b0 ^ _b1);
		return ret;
	}
	
	public String exWN2PluginFitUpgradeStart(String jsonData) {
		
		Log.d("dklog", "[ExtendWNInterface] - exWN2PluginFitUpgradeStart 1 jsonData = " + jsonData.toString());
		
		JSONObject returnValue = new JSONObject();
		
//		String deviceAddress = BleUtils.getStringFromStorage("DEVICE_ADDRESS", callerObject);
		String deviceAddress = DFUHandler.getInstance().dfu_DeviceAddress;
		if(deviceAddress.isEmpty() || deviceAddress.length() < 10 || jsonData.isEmpty()) {
			try {
				returnValue.put("status", "FAIL");
				returnValue.put("error", "Device Address is empty.");
			} 
			catch (JSONException e1) {
				e1.printStackTrace();
			}
			return returnValue.toString();
		}
		
		
		if (!BleUtils.isAPI18Over()) {
			try {
				returnValue.put("status", "FAIL");
				returnValue.put("error", "Not Supported API.");
			} 
			catch (JSONException e1) {
				e1.printStackTrace();
			}
			return returnValue.toString();
		}
		
		JSONObject jsonObj = null;
		try {
			jsonObj = new JSONObject(jsonData);
			upgradeCallback = jsonObj.getString("callback");
		} catch (JSONException e1) {
			e1.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		Log.d("dklog", "[ExtendWNInterface] - exWN2PluginFitUpgradeStart 2 upgradeCallback : " + upgradeCallback);
		try {
//			FitHandler.getInstance().terminateFitService();
//			Thread.sleep(1000);
			DFUHandler.getInstance().airUpgrade(callerObject);
		
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		try {
			returnValue.put("status", "PROCESSING");
			returnValue.put("count", "0");
		} 
		catch (JSONException e1) {
			e1.printStackTrace();
		}
		return returnValue.toString();
		
	}
	
//	@JavascriptInterface
//	public void exWN2PluginFitUpgradeIsReady(String jsonData) {
//
//		Log.d("dklog", "[ExtendWNInterface] exWN2PluginFitUpgradeIsReady");
//		JSONObject jsonObj = null;
//		try {
//			jsonObj = new JSONObject(jsonData);
//			readyCallback = jsonObj.getString("callback");
//		} catch (JSONException e1) {
//			e1.printStackTrace();
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//	}
	
	@JavascriptInterface
	public void exWN2PluginFitUpgradeReady(String jsonData) {

		Log.d("dklog", "[ExtendWNInterface] exWN2PluginFitUpgradeReady");
		JSONObject jsonObj = null;
		try {
			jsonObj = new JSONObject(jsonData);
			readyCallback = jsonObj.getString("callback");
		} catch (JSONException e1) {
			e1.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		String deviceName = FitHandler.getInstance().getDeviceName();
		String deviceAddress = FitHandler.getInstance().getDeviceAddress();
		Log.d("dklog", "[ExtendWNInterface] - exWN2PluginFitUpgrade 1 deviceAddress = " + deviceAddress);
		
//		DFUHandler.getInstance().readyForDFU(callerObject);
		
		if(deviceAddress.isEmpty() || deviceAddress.length() < 10 || jsonData.isEmpty()) {
			return;
		}
		
		Log.d("dklog", "[ExtendWNInterface] - wn2PluginFitTest 2 ");
		try {
			jsonObj = new JSONObject(jsonData);
		} catch (JSONException e1) {
			e1.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		ServiceMonitor serviceMonitor = ServiceMonitor.getInstance();
		serviceMonitor.stopMonitoring(callerObject);
		
		FitHandler.getInstance().stopFitServiceForDfu();
		
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		
		DFUHandler.getInstance().setHandler(callbackHandler);
		if (DFUHandler.getInstance().bindDFUService(callerObject, deviceName, deviceAddress)) {
//			try {
//				Thread.sleep(100);
////				
//			} catch (InterruptedException e) {
//				// TODO Auto-generated catch block
//				e.printStackTrace();
//			}
		}
	
	}
	
	
	@JavascriptInterface
	public void wn2PluginFitTest(String jsonData) {
		Log.d("dklog", "[ExtendWNInterface] wn2PluginFitTest");
	}
	/**
	 * 최초 서비스 starting 하는 API
	 */
	@JavascriptInterface
	public void wnStartService(){
		Intent intent = new Intent(callerObject, SynchService.class);
		intent.putExtra(SynchService.COMMAND,SynchService.INIT_START_SERVICE);
		callerObject.startService(intent);
	}
	/**
	 * 수동 동기화 활성화  API 
	 *//*
	@JavascriptInterface
	public void wnManualSynch(String jsonData){
		Intent serviceIntent = new Intent(callerObject, SynchService.class);
        serviceIntent.putExtra(SynchService.COMMAND,SynchService.MANUAL_SYNCH);
        callerObject.startService(serviceIntent);
	}*/
	/**
	 * 로그아웃 시 활성화되는 API
	 */
	@JavascriptInterface
	public void wnRemoveLocalData(){
		Intent intent = new Intent(callerObject, SynchService.class);
		intent.putExtra(SynchService.COMMAND,SynchService.REMOVE_LOCAL_DATA);
		callerObject.startService(intent);
	}
	/**
	 * 최초 앱 설치 혹은 이번 버전 처음 설치하는 사람에 대한 밴드 데이터 LOADING 처리를 위한 API
	 */
	@JavascriptInterface
	public void wnInsertInitData(){
		Intent intent = new Intent(callerObject, SynchService.class);
		intent.putExtra(SynchService.COMMAND,SynchService.INIT_DATA);
		callerObject.startService(intent);
		
	}
	/**
	 * 기존에 동기화하는 것이 있으면 PAUSE 시켜주는 API 
	 * 현재 동기화 중인 것 unlock (pause)
	 */
	@JavascriptInterface
	public void wnStopHistoryDetail(){
		CommonLibUtil.setVariable("BLE_LOCK", "UNLOCK");
		FitManager.getInstance(callerObject).setSynchStop(true);
	}
	
	public String callbackFunction;
	@JavascriptInterface
	public void wnGetSleepSamples(String jsonData){
		Log.d("hyjeon", " 수면 샘플을 가져오는 API 1");
		
		try {
			JSONObject parameter;
			parameter = new JSONObject(jsonData);
			
			if(parameter.has("databaseCallback")){
				Log.d("hyjeon", " 수면 샘플을 가져오는 API 7");
				callbackFunction = parameter.getString("databaseCallback");
			}else{
				Log.d("hyjeon", " 수면 샘플을 가져오는 API 8");
				callbackFunction = parameter.getString("databaseCallback");
			}
			
			
		} catch (JSONException e1) {
			e1.printStackTrace();
		}
//		
		String sleepStart = BleUtils.getStringFromStorage(BleUtils.SLEEP_START,callerObject );
		String sleepEnd   = BleUtils.getStringFromStorage(BleUtils.SLEEP_END,callerObject );
		
		DatabaseManager databaseManager = DBUtils.getDbOpenHelper(callerObject);
		String sleepPeriod[] = new String[]{};
		
		sleepPeriod = SummaryUtil.getTheMostRecentSleepStart(DBUtils.getCurrDateTime(), DBUtils.getCurrDateTimeDetail(), sleepStart, sleepEnd, true );
		Log.d("hyjeon","어제의 샘플 기간 "+ sleepPeriod[0] +" 에서 " + sleepPeriod[1] + " 까지의 샘플을 query 한다.");
		
		List<SamplesInfo> samples = databaseManager.getSamples(sleepPeriod[0],sleepPeriod[1]);
		
		JSONArray jsonArray = new JSONArray();
		final JSONObject body = new JSONObject();
		try {
			for (int i = 0; i < samples.size(); i++) {
				SamplesInfo info = samples.get(i);
				JSONObject element = new JSONObject();
				element.put("SAMPLE_DATE", info.getSamplesDateId());
				element.put("SAMPLE_HOUR", info.getHour());
				element.put("SAMPLE_TIME", info.getTime());
				element.put("SAMPLE_VALUE", info.getValue());
				element.put("SAMPLE_DATETIME", info.getDatetime());
				jsonArray.put(i, element);
				Log.d("hyjeon","[ 수면 시간   ]"+ info.getDatetime() + ":" + info.getValue());
			}
			Log.d("hyjeon","samples  사이즈 :" + samples.size());
			body.put("sampleItems", jsonArray);
		} catch (JSONException e) {

		}
		
		Log.d("hyjeon","수면 시간 JSON  : " + body.toString());
		
		callerObject.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				try {
					webView.loadUrl("javascript:"+callbackFunction+ "(" + body.toString() + ");");
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		});
	}
	
	@JavascriptInterface
	public void wnStopApplication(){
		callerObject.finish();
	}
	@JavascriptInterface
	public void wnSetSendSummaryParam(String jsonData){
		JSONObject object;
		try {
			object = new JSONObject(jsonData);
			Log.d("hyjeon", "wnSetSendSummaryParam 유저키:" + object.getString("user_key"));
			Log.d("hyjeon", "wnSetSendSummaryParam 골 스탭:" + object.getString("goal_value"));
			Log.d("hyjeon", " 수면 시작:" + object.getString("sleep_start"));
			Log.d("hyjeon", " 수면 종료:" + object.getString("sleep_end"));
		
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
	@JavascriptInterface
	public void wnChangeSleepingTime(String sleepInfo){
		
		CommonLibUtil.setUserConfigInfomation("sleep_start",sleepInfo,callerObject);
		
		BleUtils.setStringToStorage(BleUtils.SLEEP_START, 	sleepInfo.split("-")[0], callerObject);
		BleUtils.setStringToStorage(BleUtils.SLEEP_END, 	sleepInfo.split("-")[1], callerObject);
		
		Log.d("hyjeon" ,"wnChangeSleepingTime > 변경 수면 종료 시간 :" + BleUtils.getStringFromStorage(BleUtils.SLEEP_END, callerObject));
		
		Intent intent = new Intent(callerObject, SynchService.class);
		intent.putExtra(SynchService.COMMAND,SynchService.SLEEP_CHANGE);
		callerObject.startService(intent);
	}
	
}
