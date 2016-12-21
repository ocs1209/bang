package com.uracle.wellness.samples.activity;

import java.util.ArrayList;

import m.client.android.library.core.model.NetReqOptions;
import m.client.android.library.core.view.AbstractFragmentActivity;
import m.client.android.library.core.common.CommonLibHandler;
import m.client.android.library.core.common.DataHandler;
import m.client.android.library.core.common.LibDefinitions;
import m.client.android.library.core.common.Parameters;
import m.client.android.library.core.utils.CommonLibUtil;
import m.client.android.library.core.utils.ImageLoader;
import android.content.Context;
import android.content.Intent;
import android.content.res.Resources;
import android.database.Cursor;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.TextView;


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
public class ImageList1Activity extends AbstractFragmentActivity implements OnItemClickListener {
	ArrayAdapter<Dir> mAdapter=  null;
	boolean[] mChecked = null;
	ArrayList<Dir> mImageList = null;
	ImageLoader mImageLoader  = null;
	private int LAYOUT_IMAGELIST = 0;
	private int ID_LIST = 0;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		initID(this);
		setContentView(LAYOUT_IMAGELIST);
		
		mImageList = getImage();
		mImageLoader = new ImageLoader(this);
		ListView list = (ListView)findViewById(ID_LIST);
		list.setOnItemClickListener(this);
		list.setAdapter(new ArrayAdapter<Dir>(this, 0, mImageList){
			@Override
			public View getView(int position, View convertView, ViewGroup parent) {
				ListItem item = null;
				if (convertView == null) {
					item = new ListItem(ImageList1Activity.this);
					convertView = item;
				} else {
					item = (ListItem)convertView;
				}
				
				Dir dir = getItem(position);
				convertView.setTag(dir);
				if (dir.mArray.size() != 1) {
					item.image[1].setTag(dir.mArray.get(1)[Dir.PATH]);
					mImageLoader.DisplayImage(dir.mArray.get(1)[Dir.PATH],
											ImageList1Activity.this, 
											item.image[1]);
				} else {
					item.image[1].setVisibility(View.GONE);
				}
				item.image[0].setTag(dir.mArray.get(0)[Dir.PATH]);
				mImageLoader.DisplayImage(dir.mArray.get(0)[Dir.PATH],
											ImageList1Activity.this, 
											item.image[0]);
				
				item.textview.setText(String.format("%s \n%d item(s)", dir.mDirName, dir.mArray.size()));
				
				return convertView;
			}
		});
	}
	
	/**
	 * ID초기화 
	 * @param context
	 */
	private void initID(Context context) {
		Resources res = context.getResources();
		
		LAYOUT_IMAGELIST = res.getIdentifier("image_folder_list", "layout", context.getPackageName());
		ID_LIST = res.getIdentifier("list", "id", context.getPackageName());
	}

	/**
	 * 모든 이미지를 검색 하여 이미지가 포함된 경로별로 이미지를 구분하여 리스트 형태로 만들어 준다.
	 * @return
	 */
	private ArrayList<Dir> getImage() {
		ArrayList<Dir> array = new ArrayList<Dir>();
		String[] proj = {
				MediaStore.Images.Media.DATA,
				MediaStore.Images.Media.DISPLAY_NAME,
				MediaStore.Images.Media.ORIENTATION,
		};
		
		Cursor imageCursor = getContentResolver().query(MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
				proj, null, null, null);
		
		if (imageCursor != null && imageCursor.moveToFirst()){
			String path;
			String name;
			int orientation=0;
			
			do {
				path = imageCursor.getString(0);			// 파일의 경로가 나온다.
				name = imageCursor.getString(1);	// 파일 이름만 나온다.
				orientation = imageCursor.getInt(2);	// orientation
			
				if (name != null) {
//					String dir = new File(path).getParent();
					String dir = path.substring(0, path.lastIndexOf("/"));
					Dir folder = checkFolder(array, dir);
					folder.mArray.add(new String[]{path, name, orientation+""});
				}
			} while (imageCursor.moveToNext());
		}
		if (imageCursor != null) imageCursor.close();
		
		return array;
	}
	
	/**
	 * 폴더별로 이미지를 리스트에 추가
	 * @param array
	 * @param path
	 * @return
	 */
	private Dir checkFolder(ArrayList<Dir> array, String path) {
		Dir dir = null;
		for (int i = 0; i < array.size(); i++) {
			if (array.get(i).mDirPath.contains(path)) {
				return dir = array.get(i);
			}
		}
		dir = new Dir();
		dir.mDirPath = path;
		dir.mDirName = path.substring(path.lastIndexOf("/")+1);
		array.add(dir);
		
		return dir;
	}
	
	@Override
	public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
		Dir dir = (Dir)view.getTag();
    	Parameters param = new Parameters();
    	param.putParam("dir", dir.mArray);
		CommonLibHandler.getInstance().getController().
		actionMoveActivity(LibDefinitions.libactivities.ACTY_LISTIMAGE2, 
							CommonLibUtil.getActionType(null), 
		    				this, 
		    				null, 
		    				param);
	}
	
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
		
		// 이미지를 선택 하고 넘어 왓을때
		if (resultCode == RESULT_OK && 
				requestCode == LibDefinitions.libactivities.ACTY_LISTIMAGE2) {
			setResult(RESULT_OK, data);
			finish();
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
	 * ListItem Class
	 * 
	 * @author 성시종(<a mailto="sijong@uracle.co.kr">sijong@uracle.co.kr</a>)
	 * @version v 1.0.0
	 * @since Android 2.1 <br>
	 *        <DT><B>Date: </B>
	 *        <DD>2011.07</DD>
	 *        <DT><B>Company: </B>
	 *        <DD>Uracle Co., Ltd.</DD>
	 *        
	 * 폴더별 이미지 리스트를 만든다.
	 * 
	 * Copyright (c) 2001-2011 Uracle Co., Ltd. 
	 * 166 Samseong-dong, Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
	 */
	class ListItem extends RelativeLayout {
		ImageView[] image = null;
		TextView textview = null;
		
		/**
		 * 생성자
		 * Xml을 사용하지 않고 직접 생성 하여 사용한다.
		 * @param context
		 */
		public ListItem(Context context) {
			super(context);
			image = new ImageView[]{new ImageView(context), new ImageView(context)};
			textview = new TextView(context);
			image[0].setId(1);
			image[1].setId(2);
			textview.setId(3);
			
			float density = getResources().getDisplayMetrics().density;
			
			LayoutParams params = new LayoutParams((int) (50 * density), (int) (50 * density));
			params.addRule(RelativeLayout.ALIGN_PARENT_RIGHT, 3);
			image[0].setLayoutParams(params);
			params = new LayoutParams((int) (50 * density), (int) (50 * density));
			params.addRule(RelativeLayout.LEFT_OF, 1);
			image[1].setLayoutParams(params);
			
			addView(textview);
			addView(image[0]);
			addView(image[1]);
		}
	}
	
	/**
	 * Dir Class
	 * 
	 * @author 성시종(<a mailto="sijong@uracle.co.kr">sijong@uracle.co.kr</a>)
	 * @version v 1.0.0
	 * @since Android 2.1 <br>
	 *        <DT><B>Date: </B>
	 *        <DD>2011.07</DD>
	 *        <DT><B>Company: </B>
	 *        <DD>Uracle Co., Ltd.</DD>
	 *        
	 * 폴더별 이미지 리스트를 만든다.
	 * 
	 * Copyright (c) 2001-2011 Uracle Co., Ltd. 
	 * 166 Samseong-dong, Gangnam-gu, Seoul, 135-090, Korea All Rights Reserved.
	 */
	public class Dir {
		/** 파일의 PATH */
		static final int PATH = 0;
		/** 파일의 이름 */
		static final int NAME = 1;
		/** Orientation */
		static final int ORIENTATION = 2;
		String mDirName = new String();
		String mDirPath = new String();
		ArrayList<String[]> mArray = new ArrayList<String[]>();
	}

	public void onRestoreActivity(Parameters params) {
		// TODO Auto-generated method stub
		
	}

	public void onFinishedCaptureView() {
		// TODO Auto-generated method stub
		
	}

	public void onApplicationWillTerminate() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void addClassId() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public int getClassId() {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public int getNextClassId() {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public Parameters getParameters() {
		// TODO Auto-generated method stub
		return null;
	}
}
