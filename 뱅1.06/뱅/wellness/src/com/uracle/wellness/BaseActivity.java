package com.uracle.wellness;

import m.client.android.library.core.view.MainActivity;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;

/**
 * BaseActivity Class
 * 
 * @author 김태욱(<a mailto="tukim@uracle.co.kr">tukim@uracle.co.kr</a>)
 * @version v 1.0.0
 * @since Android 2.1 <br>
 *        <DT><B>Date: </B>
 *        <DD>2013.08.01</DD>
 *        <DT><B>Company: </B>
 *        <DD>Uracle Co., Ltd.</DD>
 * 
 * 모피어스 내에서 제공되는 모든 Web 페이지의 기본이 되는 Activity
 * html 화면은 모두 BaseActivity 상에서 출력된다.
 * 제어를 원하는 이벤트들은 overriding 하여 구현하며, 각각 페이지 별 이벤트는 화면 단위로 분기하여 처리한다.
 * 플랫폼 내부에서 사용하는 클래스로 해당 클래스의 이름은 변경할 수 없다.
 * 
 * Copyright (c) 2001-2011 Uracle Co., Ltd. 
 * 166 Samseong-dong, Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
 */

public class BaseActivity extends MainActivity {
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		// TODO Auto-generated method stub
		super.onCreate(savedInstanceState);

		
		if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT) {
			System.out.println("getWebView().getUrl(): " + getWebView().getName());
			if (getWebView() != null && getWebView().getName() != null
					&& (getWebView().getName().contains("user.terms.html") || getWebView().getName().contains("dashboard.body.composition.html"))) {
				getWindow().setFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED, WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
			}
			else {
				getWindow().clearFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
			}
		}
	}

	/**
	 * Webview가 시작 될 때 호출되는 함수
	 */
	@Override
	public void onPageStarted (WebView view, String url, Bitmap favicon) {
		super.onPageStarted(view, url, favicon);
	}
	
	@Override
	protected void onPause() {
		// TODO Auto-generated method stub
		super.onPause();
		
		try {
			//MPWebView.class.getMethod("onResume").invoke(getCurrentMPWebView());
			Class.forName("android.webkit.WebView").getMethod("onResume", (Class[]) null)
	        	.invoke(getCurrentMPWebView(), (Object[]) null);
			
			//getCurrentMPWebView().resumeTimers();
		} catch(Exception e) {
	        e.printStackTrace();
	    }
	}

	@Override
	protected void onStop() {
		// TODO Auto-generated method stub
		super.onStop();
		
		try {
			//MPWebView.class.getMethod("onResume").invoke(getCurrentMPWebView());
			Class.forName("android.webkit.WebView").getMethod("onResume", (Class[]) null)
	        	.invoke(getCurrentMPWebView(), (Object[]) null);
			
			//getCurrentMPWebView().resumeTimers();
		} catch(Exception e) {
	        e.printStackTrace();
	    }
	}

	/**
	 * Webview내 컨텐츠가 로드되고 난 후 호출되는 함수
	 */
	@Override
	public void onPageFinished(WebView view, String url)  {
		super.onPageFinished(view, url);
				
//		try {
//			//InfoEvent
//			JSONObject _objInfoEvent = new JSONObject(getWebView().getWNInterfaceManager().getInterfaceJS().wn2InfoEvent());
//			Logger.print(_objInfoEvent.toString(4));
//			
//			//InfoApp
//			JSONObject _objInfoApp = new JSONObject(getWebView().getWNInterfaceManager().getInterfaceJS().wn2InfoApp());
//			Logger.print(_objInfoApp.toString(4));
//			
//			//InfoStack
//			JSONArray _arrayInfoStack = new JSONArray(getWebView().getWNInterfaceManager().getInterfaceJS().wn2InfoStack());
//			Logger.print(_arrayInfoStack.toString(4));
//			
//			//InfoDevice
//			JSONObject _objInfoDevice = new JSONObject(getWebView().getWNInterfaceManager().getInterfaceJS().wn2InfoDevice());
//			Logger.print(_objInfoDevice.toString(4));
//			
//			JSONObject _objTmp = new JSONObject();
//			_objTmp.put("path", "app://res");
//		
//			//FileInfo
//			JSONObject _objFileInfo = new JSONObject(getWebView().getWNInterfaceManager().getInterfaceJS().wn2FileInfo(_objTmp.toString()));
//			Logger.print(_objFileInfo.toString(4));
//						
//			_objTmp.put("path", "ext://getExternalFilesDir.txt");
//			
//			_objFileInfo = new JSONObject(getWebView().getWNInterfaceManager().getInterfaceJS().wn2FileInfo(_objTmp.toString()));
//			Logger.print(_objFileInfo.toString(4));
//			
//			_objTmp.put("path", "doc://sample1");
//			_objTmp.put("type", "DIR");
//			 
//			_objFileInfo = new JSONObject(getWebView().getWNInterfaceManager().getInterfaceJS().wn2FileInfo(_objTmp.toString()));
//			Logger.print(_objFileInfo.toString(4));
//						
////			getWebView().getWNInterfaceManager().getInterfaceJS().wnCopyResourceFiles("res", "res", "100000");
//
//			_objTmp.put("encode", "UTF-8");
//			_objTmp.put("path", "doc://getFilesDir.txt");
//			_objTmp.put("indicator", "테스트 메세지 TEST !@#$%123");
//			
//			getWebView().getWNInterfaceManager().getInterfaceJS().wn2FileRead(_objTmp.toString(), "SAMPLE CALLBACK");
//			
//			_objTmp.put("encode", "UTF-8");
//			_objTmp.put("path", "app://res/README");
//			_objTmp.put("indicator", "테스트 메세지 TEST !@#$%123");
//			
//			getWebView().getWNInterfaceManager().getInterfaceJS().wn2FileRead(_objTmp.toString(), "SAMPLE CALLBACK");
//		} catch(Exception e) {
//			e.printStackTrace();
//		}
				
//		try {
//			JSONObject _objTmp = new JSONObject();
//			_objTmp.put("indicator", "복사중입니다.");
//			_objTmp.put("source", "app://");
//			_objTmp.put("destination", "ext://res");
//			_objTmp.put("overwrite", "YES");
//						
//			JSONArray _ja = new JSONArray();
//			_ja.put(_objTmp.toString());
//			_ja.put("onProgress");
//			_ja.put("onResult");
//			
//			long _elapsedTime = System.currentTimeMillis();
//			
//			getWebView().getWNInterfaceManager().getInterfaceJS().wnCommonInterface("wn2FileMove", _ja.toString());
//			Logger.print("_elapsedTime : " + (System.currentTimeMillis() - _elapsedTime));
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
	}
}
