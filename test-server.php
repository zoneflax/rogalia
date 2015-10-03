<?php
echo <<<HTML
<form enctype="multipart/form-data" action="" method="POST">
             <input type="hidden" name="MAX_FILE_SIZE" value="30000">
             Отправить этот файл: <input name="file" type="file">
             <input type="submit" value="Send File">
             </form>
<form  action="" method="POST">
<input type="hidden" name="reboot">
<button>Reboot</button>
</form>
HTML;

if (isset($_POST["reboot"])) {
    system("ssh igorekv 'killall -s INT server && killall -s INT server'");
} else if (count($_FILES) > 0) {
    $uploadfile = "/tmp/mobs.js";
    echo '<pre>';
    if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadfile)) {
        echo "Файл корректен и был успешно загружен.\n";
        system("scp $uploadfile igorekv:/home/tatrix/www/rogalik/server/bin/world/mobs.metadata.json");
    } else {
        echo "Возможная атака с помощью файловой загрузки!\n";
    }

    print "</pre>";
}
