<?php
if ($_FILES ["Filedata"] ["error"] > 0) 
{    
exit("Error: " . $_FILES ["Filedata"]["error"]);
}
$filesize = $_FILES['Filedata']['size'];
$filetype = $_FILES['Filedata']['type'];

if ($filesize>512*1024)
{
	echo '上传失败，文件尺寸过大。';
	exit;
}


$FileName=$_FILES['Filedata']['name'];
$FileExt=substr($FileName,strlen($FileName)-4,4);
$target_path=date("Ymdhms").floor(microtime()*100000).$FileExt;

if ($FileExt!=".gif" && $FileExt!=".jpg" && $FileExt!=".png")
{
	echo '上传失败，只能够上传图片文件。';
	exit;
}
//测试函数:　move_uploaded_file
//也可以用函数：copy
move_uploaded_file($_FILES['Filedata']['tmp_name'], $target_path);

//ResizeImage($target_path,$target_path,130,98);
echo $target_path;
?>