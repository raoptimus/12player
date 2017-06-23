<?php
/**
 * Created by PhpStorm.
 * User: ra
 * Date: 18.08.14
 * Time: 18:55
 */

$command = (count($argv) > 1) ? $argv[1] : "";
$commandList = [
    "build",
    "rebuild",
    "compile",
    "flash"
];
if (!in_array($command, $commandList))
{
    exit("The command '" . $command . "' not found. Use commands: '" . implode("', '", $commandList) . "'\n");
}

$pathDev = __DIR__ . "/dev";
$buildPath = __DIR__ . "/build";
$status = [];

if ($command == "flash")
{
    $flashPath = "/Users/ra/DevProjects/Flash/TubeContextPlayerJs/bin";
    $releaseFlash = $flashPath . "/tc_no_gui.swf";
    $debugFlash = $flashPath . "/tc_no_gui_debug.swf";

    if (!is_file($releaseFlash))
        exit("Flash player not found in {$debugFlash}");

    if (!is_file($debugFlash))
        exit("Flash player not found in {$debugFlash}");

    $destReleaseFlash = $pathDev . "/12player.swf";
    $destDebugFlash = $pathDev . "/12player.debug.swf";

    $status[] = (int)@copy($releaseFlash, $destReleaseFlash);
    $status[] = (int)@copy($debugFlash, $destDebugFlash);

    if (array_sum($status) < count($status))
    {
        print "Update flash player is failed";
    }
    else
    {
        print "Update flash player is successfully finish";
    }

    exit("\n.\n");
}

//uglify
$uglifyjs = (isset($_SERVER['windir']))
    ? '"C:\\Program Files (x86)\nodejs\node" node_modules/uglify-js/bin/uglifyjs'
    : "/opt/local/bin/uglifyjs";

exec($uglifyjs . " --version", $o, $s);

if (intval($s) !== 0)
{
    $bin = dirname($uglifyjs);
    $uglifyjs = false;

    print "Not found 'uglifyjs'.
        Please install:
         * nodejs (port install nodejs),
         * tnpm (port install npm),
         * tuglifyjs (npm install uglify-js).
        Add PATH in your .profile '{$bin}'.
    ";
}

print "Uglifyjs found version '" . implode(" ", $o) . "'\n";

//compile core
$files = [
    "tc-ex",
    "tc-player-loader",
    "tc-player-ads",
    "tc-tcplayer",
    "tc-player",
    "tc-core-1.11.1",
    "tc-mcore-1.4.3",
];

foreach ($files as $file)
{
    $fileDev = $pathDev . "/" . $file . ".js";
    $fileMin = $pathDev . "/" . $file . ".min.js";

    print "Compile '$fileDev' to '{$fileMin}'\n";
    //exec($uglifyjs . " " . $fileDev . " -o" . $fileMin, $o, $s);
    exec($uglifyjs . " -o " . $fileMin . " " . $fileDev, $o, $s);
    $status[] = (int)!intval($s);
}

//compile core
$files = [
    "tc-core-1.11.1", //can read from http jquery
    "tc-mcore-1.4.3",
    "tc-ex"
];

foreach ($files as $k => $file)
{
    $flag = ($k == 0) ? null : FILE_APPEND;
    $source = @file_get_contents($pathDev . "/" . $file . ".js");
    $status[] = (int)!!$source;
    $status[] = (int)@file_put_contents($pathDev . "/tc-core-custom.js", $source, $flag);

    $source = @file_get_contents($pathDev . "/" . $file . ".min.js");
    $status[] = (int)!!$source;
    $status[] = (int)@file_put_contents($pathDev . "/tc-core-custom.min.js", $source, $flag);
}

//compile player.js
$files = [
    "tc-core-custom", //can read from http jquery
    "tc-tcplayer",
    "tc-player-ads"
];

foreach ($files as $k => $file)
{
    $flag = ($k == 0) ? null : FILE_APPEND;
    $source = @file_get_contents($pathDev . "/" . $file . ".js");
    $status[] = (int)!!$source;
    $status[] = (int)@file_put_contents($pathDev . "/tc-player-full.js", $source, $flag);

    $source = @file_get_contents($pathDev . "/" . $file . ".min.js");
    $status[] = (int)!!$source;
    $status[] = (int)@file_put_contents($pathDev . "/tc-player-full.min.js", $source, $flag);
}

if (array_sum($status) < count($status))
{
    exit("Compile js is failed.\n");

}
else
{
    print "Compile js is successfully finish.\n";
}

if ($command == "compile")
{
    exit("\n.\n");
}

//new build folder
$last = glob($buildPath . "/*.*", GLOB_ONLYDIR);

if (empty($last))
    $last = ["2.0"];

$last = floatval(basename(end($last)));
$ver = ($command == "build") ? $last + 0.01 : $last;

$buildPath = $buildPath . "/" . $ver;

if (!is_dir($buildPath))
{
    mkdir($buildPath);
}
else
{
    print "The directory '{$buildPath}' is exists. Skip make.\n";
}

//compile player
$files = [
    "12player.swf",
    //"tc-player-loader.min.js",
    "tc-player.min.js",
    "tc-player-ads.min.js",
    "tc-tcplayer.min.js",
    "tc-core-custom.min.js",
    //"tc-player-full.min.js",
];

$file = $buildPath . "/player.zip";
$zip = new ZipArchive();
$zip->open($file, ZipArchive::CREATE);

foreach ($files as $file)
{
    $status[] = (int)copy($pathDev . "/" . $file, $buildPath . "/" . $file);

    if ($file !== "tc-player-ads.min.js")
        $zip->addFile($pathDev . "/" . $file, $file);
}

//compile skin for player
exec("rm -rf " . $buildPath . "/skin && cp -r " . $pathDev . "/skin " . $buildPath);

function glob_recursive($pattern, $flags = 0)
{
    $files = glob($pattern, $flags);

    foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir)
    {
        $files = array_merge($files, glob_recursive($dir.'/'.basename($pattern), $flags));
    }

    return $files;
}

foreach(glob_recursive($buildPath . "/skin/*.*") as $file)
{
    $zip->addFile($file, str_replace($buildPath, "", $file));
}

$zip->close();

//cope dev version build
$buildDevPath = $pathDev . "/" . $ver;

if (!is_dir($buildDevPath))
{
    mkdir($buildDevPath);
}
else
{
    print "The directory '{$buildDevPath}' is exists. Skip make.\n";
}

$devFiles = [
    "12player.swf",
    "tc-player-loader.js",
    "tc-player.js",
    "tc-player-ads.js",
    "tc-tcplayer.js",
    "tc-core-custom.js",
    "tc-player-full.js",
    "index.html",
    "index_frame.html",
];

foreach ($devFiles as $devFile)
{
    $status[] = (int)copy($pathDev . "/" . $devFile, $buildDevPath . "/" . $devFile);
}

exec("rm -rf " . $buildDevPath . "/skin && cp -r " . $pathDev . "/skin " . $buildDevPath);

//msg
$msg = "";

if (array_sum($status) < count($status))
{
    switch ($command)
    {
        case "build":
            $msg = "Building new version '{$ver}' of the player is failed";
            break;

        case "rebuild":
            $msg = "Rebuilding version '{$ver}' of the player is failed";
            break;
    }
} else
{
    switch ($command)
    {
        case "build":
            $msg = "New version '{$ver}' of the player successfully built";
            break;

        case "rebuild":
            $msg = "Version '{$ver}' of the player successfully rebuilt";
            break;
    }
}

print $msg . "\n.\n";