


<html>

<head>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<title></title>

</head>

<body 	style="margin-top: 0;margin-left: 0;">

<table width=100%>
<tr>
<td>
<form enctype="multipart/form-data" action="loadup.php?action=upfile" method=post> 

<input type="hidden" name="MAX_FILE_SIZE" value="2000000">

<input type=file name=upfile size=20>

<input type=submit value='上传文件'> 

</form> 
</td><td>
<?php


if($_GET['action'] == 'upfile')  
{  



$uploadfile = $_FILES['upfile']['name'];



if (move_uploaded_file($_FILES['upfile']['tmp_name'], $uploadfile)) {

   echo "上传成功,文件名:".$uploadfile;

}else {

   echo "<script> alert('上传失败！');window.location.href='loadup.php';</script>";

}
}
?>
</td></tr></table>
</body>

</html>