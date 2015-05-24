
<?php
error_reporting(0);
$Code=$_GET["Code"];
if (!file_exists($Code))
mkdir($Code);

$target_path = $Code."/".date("Ymdhms").floor(microtime()*100000).".jpg";
$xmlstr =  $GLOBALS[HTTP_RAW_POST_DATA];    
if(empty($xmlstr)) 
{        
$xmlstr = file_get_contents('php://input');    
}         
$jpg = $xmlstr;//得到post过来的二进制原始数据    
$file = fopen("".$target_path,"w");//打开文件准备写入    
fwrite($file,$jpg);//写入    
fclose($file);//关闭
echo "uploads/".$target_path;


?>
