
//菜单层静态类
function Menu(){};
Menu.layer=null;
Menu.create=function(){
	//加载UI
	Menu.layer=cu.loadScene(sceneRes.menu)
	var button=cu.get("Button_main",Menu.layer);
	button.addClickEventListener(
			function()
			{
				Home.create();
			});

	button=cu.get("Button_part",Menu.layer);
	button.addClickEventListener(
			function()
			{
				Part.create();
			});		
	button=cu.get("Button_bag",Menu.layer);
	button.addClickEventListener(
			function()
			{
				Bag.create()
			});			
	button=cu.get("Button_streng",Menu.layer);
	button.addClickEventListener(
			function()
			{
				Streng.create();
			});		
	return Menu.layer.node;
};
Menu.setButton=function(name)
{
	var button=cu.get(name,Menu.layer); 
	button.setBright(false); 
	button.setTouchEnabled(false); 
}

