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
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import com.uracle.wellness.R;

import android.app.Activity;
import android.app.ListActivity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

/**
 * Activity for scanning and displaying available Bluetooth LE devices.
 */
public class DeviceScanActivity extends ListActivity {
	private LeDeviceListAdapter mLeDeviceListAdapter;
	private ArrayList<String> deviceNameList;
	private ArrayList<Integer> deviceRssiList;
	private BluetoothAdapter mBluetoothAdapter;
	private boolean mScanning;
	private Handler mHandler;

	private static final int REQUEST_ENABLE_BT = 1;
	// Stops scanning after 10 seconds.
	private static final long SCAN_PERIOD = 10000;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		getActionBar().setTitle(R.string.app_name);
		mHandler = new Handler();

		// Use this check to determine whether BLE is supported on the device.
		// Then you can
		// selectively disable BLE-related features.
		if (!getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
			Toast.makeText(this, R.string.ble_not_supported, Toast.LENGTH_SHORT).show();
			finish();
		}

		// Initializes a Bluetooth adapter. For API level 18 and above, get a
		// reference to
		// BluetoothAdapter through BluetoothManager.
		final BluetoothManager bluetoothManager = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
		mBluetoothAdapter = bluetoothManager.getAdapter();

		// Checks if Bluetooth is supported on the device.
		if (mBluetoothAdapter == null) {
			Toast.makeText(this, R.string.error_bluetooth_not_supported, Toast.LENGTH_SHORT).show();
			finish();
			return;
		}
	}

	@Override
	public void onBackPressed() {
		// TODO Auto-generated method stub
		finish();
		System.exit(0);//�˳�
		super.onBackPressed();
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		getMenuInflater().inflate(R.menu.main, menu);
		if (!mScanning) {
			menu.findItem(R.id.menu_stop).setVisible(false);
			menu.findItem(R.id.menu_scan).setVisible(true);
			menu.findItem(R.id.menu_refresh).setActionView(null);
		} else {
			menu.findItem(R.id.menu_stop).setVisible(true);
			menu.findItem(R.id.menu_scan).setVisible(false);
			menu.findItem(R.id.menu_refresh).setActionView(R.layout.actionbar_indeterminate_progress);
		}
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		switch (item.getItemId()) {
		case R.id.menu_scan:

			mLeDeviceListAdapter.clear();
			scanLeDevice(true);
			break;
		case R.id.menu_stop:
			scanLeDevice(false);
			break;
		}
		return true;
	}

	@Override
	protected void onResume() {
		super.onResume();

		// Ensures Bluetooth is enabled on the device. If Bluetooth is not
		// currently enabled,
		// fire an intent to display a dialog asking the user to grant
		// permission to enable it.
		if (!mBluetoothAdapter.isEnabled()) {
			if (!mBluetoothAdapter.isEnabled()) {
				Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
				startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
			}
		}

		// Initializes list view adapter.
		mLeDeviceListAdapter = new LeDeviceListAdapter();
		deviceNameList = new ArrayList<String>();
		deviceRssiList = new ArrayList<Integer>();
		setListAdapter(mLeDeviceListAdapter);
		scanLeDevice(true);
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		// User chose not to enable Bluetooth.
		if (requestCode == REQUEST_ENABLE_BT && resultCode == Activity.RESULT_CANCELED) {
			finish();
			return;
		}
		super.onActivityResult(requestCode, resultCode, data);
	}

	@Override
	protected void onPause() {
		super.onPause();
		scanLeDevice(false);
		mLeDeviceListAdapter.clear();
		deviceNameList.clear();
		deviceRssiList.clear();
	}

	@Override
	protected void onListItemClick(ListView l, View v, int position, long id) {
		final BluetoothDevice device = mLeDeviceListAdapter.getDevice(position);
		if (device == null)
			return;
		final Intent intent = new Intent(this, DeviceControlActivity.class);
		intent.putExtra(DeviceControlActivity.EXTRAS_DEVICE_NAME, device.getName());
		intent.putExtra(DeviceControlActivity.EXTRAS_DEVICE_ADDRESS, device.getAddress());
		if (mScanning) {
			mBluetoothAdapter.stopLeScan(mLeScanCallback);
			mScanning = false;
		}
		// device.createBond();
		startActivity(intent);
		
		finish();
		System.exit(0);//�˳�
	}

	private void scanLeDevice(final boolean enable) {
		if (enable) {
			// Stops scanning after a pre-defined scan period.
			mHandler.postDelayed(new Runnable() {
				@Override
				public void run() {
					mScanning = false;
					mBluetoothAdapter.stopLeScan(mLeScanCallback);
					invalidateOptionsMenu();
				}
			}, SCAN_PERIOD);

			mScanning = true;
//			getBondDevice();
			mBluetoothAdapter.startLeScan(mLeScanCallback);
		} else {
			mScanning = false;
			mBluetoothAdapter.stopLeScan(mLeScanCallback);
		}
		invalidateOptionsMenu();
	}

	/**
	 * ��ȡ����Ե��豸
	 */
	private void getBondDevice() {
		Set<BluetoothDevice> pairedDevices = mBluetoothAdapter.getBondedDevices();
		if (pairedDevices.size() > 0) {
			for (BluetoothDevice device : pairedDevices) {
				if (device.getName() != null) {
					if (device.getName().contains("Dfu")) {// �����������ǣ�Ψ���ֻ�
						mLeDeviceListAdapter.addDevice(device);
						mLeDeviceListAdapter.notifyDataSetChanged();
					}
					if (device.getName().contains("X6")) {// �����������ǣ�Ψ���ֻ�
						mLeDeviceListAdapter.addDevice(device);
						mLeDeviceListAdapter.notifyDataSetChanged();
					}

				}
			}
		}
	}

	// Adapter for holding devices found through scanning.
	private class LeDeviceListAdapter extends BaseAdapter {
		private ArrayList<BluetoothDevice> mLeDevices;
		private LayoutInflater mInflator;

		public LeDeviceListAdapter() {
			super();
			mLeDevices = new ArrayList<BluetoothDevice>();
			mInflator = DeviceScanActivity.this.getLayoutInflater();
		}

		public void addDevice(BluetoothDevice device) {
			if(device == null) {
				return;
			}
			
			if (!mLeDevices.contains(device)) {
//				if (device.getName().contains("Dfu")) {
					mLeDevices.add(device);
//				}
			}
		}

		public BluetoothDevice getDevice(int position) {
			return mLeDevices.get(position);
		}

		public void clear() {
			mLeDevices.clear();
		}

		@Override
		public int getCount() {
			return mLeDevices.size();
		}

		@Override
		public Object getItem(int i) {
			return mLeDevices.get(i);
		}

		@Override
		public long getItemId(int i) {
			return i;
		}

		@Override
		public View getView(int i, View view, ViewGroup viewGroup) {
			ViewHolder viewHolder;
			// General ListView optimization code.
			if (view == null) {
				view = mInflator.inflate(R.layout.listitem_device, null);
				viewHolder = new ViewHolder();
				viewHolder.deviceAddress = (TextView) view.findViewById(R.id.device_address);
				viewHolder.deviceName = (TextView) view.findViewById(R.id.device_name);
				viewHolder.deviceRssi = (TextView) view.findViewById(R.id.device_rssi);
				view.setTag(viewHolder);
			} else {
				viewHolder = (ViewHolder) view.getTag();
			}

			BluetoothDevice device = mLeDevices.get(i);

			final String deviceName = device.getName();
			if (deviceName != null && deviceName.length() > 0) {
				viewHolder.deviceName.setText(deviceName);
			} else {
				if (i < deviceNameList.size()) {
					viewHolder.deviceName.setText(deviceNameList.get(i));
				}
				// viewHolder.deviceName.setText(R.string.unknown_device);
			}
			viewHolder.deviceAddress.setText(device.getAddress());
			if (i < deviceRssiList.size()) {
				viewHolder.deviceRssi.setText(deviceRssiList.get(i) + " dBm");
			}

			return view;
		}
	}

	// Device scan callback.
	private BluetoothAdapter.LeScanCallback mLeScanCallback = new BluetoothAdapter.LeScanCallback() {

		@Override
		public void onLeScan(final BluetoothDevice device, final int rssi, final byte[] scanRecord) {
			runOnUiThread(new Runnable() {
				@Override
				public void run() {
					if (mLeDeviceListAdapter.getCount() < 20) {

						// System.out.println("���=" + device.getName());
						if (device.getName() == null) {
							// System.out.println("���=" +
							// parseAdertisedData(scanRecord));
							deviceNameList.add(parseAdertisedData(scanRecord));
						} else {
							deviceNameList.add(device.getName());
						}
						deviceRssiList.add((int) rssi);
						// System.out.println("���=" + device.getAddress());
						// System.out.println("���=" + byteToString(scanRecord));
						if (device.getName() != null && device.getName().contains("Dfu")) {
							mLeDeviceListAdapter.addDevice(device);
							mLeDeviceListAdapter.notifyDataSetChanged();	
						}
					} else {
						// ����10ֹͣɨ��
						mScanning = false;
						mBluetoothAdapter.stopLeScan(mLeScanCallback);

						if (device.getName() != null && device.getName().contains("Dfu")) {
							mLeDeviceListAdapter.addDevice(device);
							mLeDeviceListAdapter.notifyDataSetChanged();
						}
						invalidateOptionsMenu();
					}

				}
			});
		}

	};

	static class ViewHolder {
		TextView deviceName;
		TextView deviceAddress;
		TextView deviceRssi;
	}

	/**
	 * byte������תString��ʾ
	 */
	public static String byteToString(byte[] data) {
		StringBuilder stringBuilder = new StringBuilder(data.length);
		for (byte byteChar : data) {
			stringBuilder.append(String.format("%02X ", byteChar).toString());
		}
		return stringBuilder.toString();
	}

	// ////////////////////Helper Classes: BleUtil and BleAdvertisedData
	// ///////////////
	/**
	 * �ӹ㲥���н����豸����
	 * 
	 * @param advertisedData
	 * @return
	 */
	public static String parseAdertisedData(byte[] advertisedData) {
		List<UUID> uuids = new ArrayList<UUID>();
		String name = null;
		if (advertisedData == null) {
			return null;
		}

		ByteBuffer buffer = ByteBuffer.wrap(advertisedData).order(ByteOrder.LITTLE_ENDIAN);
		while (buffer.remaining() > 2) {
			byte length = buffer.get();
			if (length == 0)
				break;

			byte type = buffer.get();
			switch (type) {
			case 0x02: // Partial list of 16-bit UUIDs
			case 0x03: // Complete list of 16-bit UUIDs
				while (length >= 2) {
					uuids.add(UUID.fromString(String.format("%08x-0000-1000-8000-00805f9b34fb", buffer.getShort())));
					length -= 2;
				}
				break;
			case 0x06: // Partial list of 128-bit UUIDs
			case 0x07: // Complete list of 128-bit UUIDs
				while (length >= 16) {
					long lsb = buffer.getLong();
					long msb = buffer.getLong();
					uuids.add(new UUID(msb, lsb));
					length -= 16;
				}
				break;
			case 0x09:
				byte[] nameBytes = new byte[length - 1];
				buffer.get(nameBytes);
				try {
					name = new String(nameBytes, "utf-8");
				} catch (UnsupportedEncodingException e) {
					e.printStackTrace();
				}
				break;
			default:
				buffer.position(buffer.position() + length - 1);
				break;
			}
		}
		return name;
	}

}
