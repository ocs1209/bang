package com.uracle.wellness.firmupgrade;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.CountDownTimer;
import android.os.IBinder;
import android.util.Log;
import m.client.library.plugin.fit.FitConstants;

public class DFUTimeoutService extends Service {

	private static Context mContext;
	private static android.os.Handler mHandler;
//	private static String callbackFuction;
//	private static HashMap<integer, String> mLogger = new HashMap<integer, String>();
	
	public DFUTimeoutService() {
	}

	public static CountDownTimer timer = null;

	@Override
	public void onCreate() {
		super.onCreate();
		Log.d("dklog-timeout", "[DFUTimeoutService] onCreate");

		timer = new CountDownTimer(10 * 1000 * 1, 1000) {
			private int val = 0;

			public void onTick(long millisUntilFinished) {
				val++;
//				Log.d("dklog-timeout", "Countdown = " + val);
			}

			public void onFinish() {
				Log.d("dklog-timeout", "Countdown finished = " + val);
				
				try {
//					FitService.returnCallback();
					mHandler.obtainMessage(FitConstants.MSG_DFU_PERCENT_100, "").sendToTarget();
					
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		};
		timer.start();
	}

	@Override
	public IBinder onBind(Intent intent) {
		throw new UnsupportedOperationException("Not yet implemented");
	}

	@Override
	public boolean onUnbind(Intent intent) {
		Log.d("dklog-timeout", "[DFUTimeoutService] onUnbind");
		return super.onUnbind(intent);
	}

	@Override
	public void onDestroy() {
		Log.d("dklog-timeout", "[DFUTimeoutService] onDestroy");
		super.onDestroy();

		if (timer != null) {
			timer.cancel();
		}
	}

	@Override
	public int onStartCommand(Intent intent, int flags, int startId) {
		Log.d("dklog-timeout", "[DFUTimeoutService] onStartCommand");
		// return super.onStartCommand(intent, START_NOT_STICKY, startId);
		return START_NOT_STICKY;
	}

	public static void resetCountdown() {
		if (timer != null) {
			timer.cancel();
			timer.start();
//			Log.d("dklog-timeout", "[LogoutService] resetCountdown. callback = " + callback.toString());
		}
	}

	public static void startTimeoutService(Context context, android.os.Handler handler) {
        mContext = context;
        mHandler = handler;
        Intent intent = new Intent(mContext, DFUTimeoutService.class);
        mContext.startService(intent); 
    }
	
}
