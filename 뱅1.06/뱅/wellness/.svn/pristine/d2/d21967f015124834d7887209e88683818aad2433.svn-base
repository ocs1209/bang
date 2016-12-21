package com.uracle.wellness.samples.activity;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import m.client.android.library.core.model.NetReqOptions;
import m.client.android.library.core.view.AbstractActivity;
import m.client.android.library.core.common.DataHandler;
import m.client.android.library.core.common.Parameters;
import m.client.android.library.core.utils.ImageLoader;
import m.client.android.library.core.utils.PLog;
import com.uracle.wellness.samples.activity.ImageList1Activity.Dir;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.GridView;
import android.widget.ImageView;


/**
 * ImageListActivity Class
 * 
 * @author 성시종(<a mailto="sijong@uracle.co.kr">sijong@uracle.co.kr</a>)
 * @version v 1.0.0
 * @since Android 2.1 <br>
 *        <DT><B>Date: </B>
 *        <DD>2011.07</DD>
 *        <DT><B>Company: </B>
 *        <DD>Uracle Co., Ltd.</DD>
 *        
 * Copyright (c) 2001-2011 Uracle Co., Ltd. 
 * 166 Samseong-dong, Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
 */
public class ImageList2Activity extends AbstractActivity implements OnItemClickListener, OnClickListener{
	private ImageLoader mImageLoader = null;
	ArrayAdapter<String[]> mAdapter=  null;
	boolean[] mChecked = null;
	ArrayList<String[]> mImageList = null;
	
	private int LAYOUT_IMAGELIST = 0;
	private int LAYOUT_ITEM = 0;
	private int ID_GRID = 0;
	private int ID_IMAGE = 0;
	private int ID_CHECK = 0;
	private int ID_ALL = 0;
	private int ID_CANCEL = 0;
	private int ID_SET = 0;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		
		initID(this);
		setContentView(LAYOUT_IMAGELIST);
		
		mImageLoader = new ImageLoader(getApplicationContext());
		mImageList = (ArrayList<String[]>)mParams.getParam("dir");
		
		mChecked = new boolean[mImageList.size()];
		
		GridView gridView = (GridView)findViewById(ID_GRID);
		setGridOrientation(getResources().getConfiguration());
		gridView.setOnItemClickListener(this);
		
		mAdapter = new ArrayAdapter<String[]>(this, 0, mImageList){
			@Override
			public View getView(int position, View convertView, ViewGroup parent) {
				ViewHolder holder = null;
				if (convertView == null){
					convertView = getLayoutInflater().inflate(LAYOUT_ITEM, null);
					holder = new ViewHolder();
					holder.image=(ImageView)convertView.findViewById(ID_IMAGE);
					holder.check=(CheckBox)convertView.findViewById(ID_CHECK);
					holder.check.setFocusable(false);
					
					holder.check.setOnClickListener(new OnClickListener() {
						
						@Override
						public void onClick(View v) {
							int position = (Integer)v.getTag();
							CheckBox check = (CheckBox)v;
							mChecked[position] = check.isChecked();
						}
					});
					
					convertView.setTag(holder);
				} else {
					holder= (ViewHolder)convertView.getTag();
				}
				
				holder.image.setTag(getItem(position)[Dir.PATH]);
				holder.check.setTag(position);
				holder.check.setChecked(mChecked[position]);

				mImageLoader.DisplayImage(getItem(position)[Dir.PATH],
											(Activity)getContext(), 
											holder.image);
				return convertView;
			}
		};
		
		findViewById(ID_ALL).setOnClickListener(this);
		findViewById(ID_CANCEL).setOnClickListener(this);
		findViewById(ID_SET).setOnClickListener(new OnClickListener() {
			
			@Override
			public void onClick(View v) {
				boolean[] _checked = mChecked;
				ArrayList<String[]> _imageArrayList = mImageList;
				//JSONObject value = new JSONObject();
				JSONArray images = new JSONArray();
				int length = _checked.length;
				try {
					for (int i = 0; i< length; i++) {
						if (_checked[i]) {
							JSONObject item = new JSONObject();
							String path = _imageArrayList.get(i)[Dir.PATH];//파일 경로
							String name = _imageArrayList.get(i)[Dir.NAME];//파일 이름
							String strOrientation  = _imageArrayList.get(i)[Dir.ORIENTATION];
							
							int orientation = 0;
							try {
								orientation = Integer.valueOf(strOrientation);
							} catch (NumberFormatException e){ }
							
							File file = new File(path);
							Date lastModifyDate = new Date(file.lastModified());
							SimpleDateFormat format = new SimpleDateFormat("yyyyMMddHHmmss");
							item.put("path",path);
							item.put("name",name);
							item.put("saveDate",format.format(lastModifyDate));//마지막 수정날짜
							item.put("size",file.length()+"");//파일 사이즈
							item.put("orientation", Integer.valueOf(orientation));//파일 사이즈
							images.put(item);
						}
					}
					//value.put("images", images);
				} catch (JSONException e) {
					PLog.printTrace(e);
				}
				
				Intent intent = new Intent();
				intent.putExtra("images", images.toString());
				setResult(RESULT_OK, intent);
				finish();
			}
		});
		gridView.setAdapter(mAdapter);
	}
	
	/**
	 * ID 초기화
	 * @param context
	 */
	private void initID(Context context) {
		Resources res = context.getResources();
		
		LAYOUT_IMAGELIST = res.getIdentifier("image_list", "layout", context.getPackageName());
		LAYOUT_ITEM = res.getIdentifier("image_list_item", "layout", context.getPackageName());
		ID_GRID = res.getIdentifier("grid", "id", context.getPackageName());
		ID_IMAGE = res.getIdentifier("image", "id", context.getPackageName());
		ID_CHECK = res.getIdentifier("check", "id", context.getPackageName());
		ID_ALL = res.getIdentifier("all", "id", context.getPackageName());
		ID_CANCEL = res.getIdentifier("cancel", "id", context.getPackageName());
		ID_SET = res.getIdentifier("set", "id", context.getPackageName());
	}

	@Override
	public void onClick(View v) {
		boolean isSelect = false;
		
		int id = v.getId();
		if (id == ID_ALL) {
			isSelect = true;
		} else if(id == ID_CANCEL){
			isSelect = false;
		}
		
		for (int i = 0;i< mChecked.length; i++) {
			mChecked[i] = isSelect;
		}
		mAdapter.notifyDataSetChanged();
	}
	
	@Override
	public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
		ViewHolder holder = (ViewHolder)view.getTag();
		holder.check.performClick();
	}
	
	@Override
	public void onConfigurationChanged(Configuration newConfig) {
		super.onConfigurationChanged(newConfig);
		setGridOrientation(newConfig);
	}
	
	/**
	 * 화면전환이 일어날경우 호출하여 화면에 변화를 준다.
	 * @param configuration
	 */
	private void setGridOrientation(Configuration configuration) {
//		GridView grid = (GridView )findViewById(ID_GRID);

		if (configuration.orientation == Configuration.ORIENTATION_LANDSCAPE) {
//			grid.setNumColumns(4);
		} else if (configuration.orientation == Configuration.ORIENTATION_PORTRAIT) {
//			grid.setNumColumns(3);
		}
	}

	@Override
	public void handlingError(String callerServerName, String trCode, String errCode, String errMessage, NetReqOptions netReqOptions) { }

	@Override
	public void requestData(String stTrCode, String otherInfos,
			DataHandler dhSendData, NetReqOptions netReqOptions) { }

	@Override
	public void responseData(int nDataType, String stTrCode, String otherInfos, String dhRecvData, NetReqOptions netReqOptions) { }

	
	/**
	 * ViewHolder Class
	 * 
	 * @author 성시종(<a mailto="sijong@uracle.co.kr">sijong@uracle.co.kr</a>)
	 * @version v 1.0.0
	 * @since Android 2.1 <br>
	 *        <DT><B>Date: </B>
	 *        <DD>2011.07</DD>
	 *        <DT><B>Company: </B>
	 *        <DD>Uracle Co., Ltd.</DD>
	 *        
	 * ListView에서 사용하기 위한 Holder class
	 * 
	 * Copyright (c) 2001-2011 Uracle Co., Ltd. 
	 * 166 Samseong-dong, Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
	 */
	class ViewHolder {
		ImageView image = null;
		CheckBox check;
	}


	@Override
	public void onRestoreActivity(Parameters params) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void onFinishedCaptureView() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void onApplicationWillTerminate() {
		// TODO Auto-generated method stub
		
	}
}
