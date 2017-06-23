<?php
$min = (@$_GET['debug'] == 1) ? "" : ".min";

header("Content-Type: application/x-javascript");
readfile(__DIR__ . "/tc-core-1.11.1" . $min . ".js");
readfile(__DIR__ . "/tc-mcore-1.4.3" . $min . ".js");
readfile(__DIR__ . "/tc-ex" . $min . ".js");