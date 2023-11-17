<?php
if (isHTMX())
	return;


//Create version hashes based on last modified time.
$versionedFiles = array(
	APP_ROOT . 'assets/favicon.svg' => '',
	APP_ROOT . 'css/styles.css' => '',
	APP_ROOT . 'css/mobile.css' => '',
	APP_ROOT . 'css/animations.css' => '',
	APP_ROOT . 'js/scripts.js' => '',
	APP_ROOT . 'vendors/htmx.min.js' => '',
);

foreach ($versionedFiles as $fileName => $hash)
{
	$versionedFiles[$fileName] = substr(md5(filemtime($_SERVER['DOCUMENT_ROOT'] . $fileName)), 0, 6);
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<title>D'Query</title>
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="color-scheme" content="dark light">
	<meta http-equiv="Content-Security-Policy" content="default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'">
	<link rel="icon" href="<?php echo APP_ROOT; ?>assets/favicon.svg?v=<?PHP echo $versionedFiles[APP_ROOT . 'assets/favicon.svg'] ?>" type="image/svg+xml">
	<link rel="stylesheet" href="<?php echo APP_ROOT; ?>css/styles.css?v=<?PHP echo $versionedFiles[APP_ROOT . 'css/styles.css'] ?>">
	<link rel="stylesheet" href="<?php echo APP_ROOT; ?>css/mobile.css?v=<?PHP echo $versionedFiles[APP_ROOT . 'css/mobile.css'] ?>">
	<link rel="stylesheet" href="<?php echo APP_ROOT; ?>css/animations.css?v=<?PHP echo $versionedFiles[APP_ROOT . 'css/animations.css'] ?>">
	<script src="<?php echo APP_ROOT; ?>vendors/htmx.min.js?v=<?PHP echo $versionedFiles[APP_ROOT . 'vendors/htmx.min.js'] ?>"></script>
	<script src="<?php echo APP_ROOT; ?>js/scripts.js" type="text/javascript"></script>
</head>
<!-- <script src="https://code.jquery.com/jquery-3.7.1.slim.min.js" integrity="sha256-kmHvs0B+OpCW5GVHUNjv9rOmY0IvSIRcf7zGUDTDQM8=" crossorigin="anonymous"></script> -->
<!-- <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" /> -->
<!-- <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script> -->
<!-- <script type="module" src="https://cdn.jsdelivr.net/npm/@duetds/date-picker@1.4.0/dist/duet/duet.esm.js"></script> -->
<!-- <script nomodule src="https://cdn.jsdelivr.net/npm/@duetds/date-picker@1.4.0/dist/duet/duet.js"></script> -->
<!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@duetds/date-picker@1.4.0/dist/duet/themes/default.css" /> -->

<body>
	<header>
		<a href="<?php echo APP_ROOT; ?>" hx-get="<?php echo APP_ROOT; ?>" hx-select="main" hx-target="main" hx-swap="outerHTML" hx-push-url="true">
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 491.52 491.52" xml:space="preserve">
				<path d="M183.855 68.79l-14.585 49.64-7.955-25.25h-19.53l-7.95 25.25-14.585-49.64-19.65 5.78 24.07 81.92 19.59.19 8.29-26.33 8.295 26.33 19.59-.19 24.07-81.92z" />
				<path d="M298.545 68.79l-14.59 49.64-7.95-25.25h-19.53l-7.95 25.25-14.59-49.64-19.65 5.78 24.075 81.92 19.59.19 8.29-26.33 8.29 26.33 19.59-.19 24.075-81.92z" />
				<path d="M413.23 68.79l-14.585 49.64-7.95-25.25h-19.53l-7.955 25.25-14.585-49.64-19.65 5.78 24.07 81.92 19.59.19 8.295-26.33 8.29 26.33 19.59-.19 24.07-81.92z" />
				<path d="M491.52 30.72H40.96v89.086C14.217 156.578 0 200.018 0 245.76c0 56.73 21.895 110.2 61.63 150.52 40.7 41.61 95.185 64.52 153.41 64.52 58.225 0 112.71-22.91 153.385-64.49 39.76-40.35 61.655-93.82 61.655-150.55 0-17.359-2.146-34.511-6.23-51.2h67.67V30.72zM40.96 159.031v35.529h58.021c-1.786 13.389-2.844 27.089-3.2 40.96H20.886c1.385-26.906 8.178-52.771 20.074-76.489zM20.974 256h74.879c.812 32.407 5.357 62.733 13.022 89.597-14.02 8.014-27.129 17.739-39.237 28.945C40.257 341.563 23.266 300.167 20.974 256zm63.03 133.117c9.739-8.951 20.211-16.791 31.323-23.478 9.644 26.264 22.482 48.142 37.522 64.379-25.352-8.544-48.687-22.376-68.845-40.901zM204.8 439.205c-28.946-6.164-54.591-38.093-70.783-83.479 22.054-10.145 45.947-16.019 70.783-17.301v100.78zm0-121.261c-26.957 1.259-52.95 7.349-76.997 18.056-6.658-24.26-10.674-51.436-11.475-80H204.8v61.944zm0-82.424h-88.539c.376-13.903 1.522-27.603 3.412-40.96H204.8v40.96zm20.48 203.685V338.424c24.836 1.282 48.729 7.156 70.783 17.301-16.192 45.387-41.837 77.316-70.783 83.48zM313.752 256c-.801 28.564-4.817 55.74-11.475 80-24.047-10.706-50.039-16.797-76.997-18.056V256h88.472zm-88.472-20.48v-40.96h85.129c1.89 13.356 3.036 27.054 3.411 40.96h-88.54zm51.949 194.499c15.041-16.237 27.88-38.116 37.524-64.381 11.114 6.688 21.586 14.53 31.326 23.481-20.152 18.523-43.49 32.355-68.85 40.9zm83.214-55.476c-12.109-11.207-25.217-20.931-39.238-28.946 7.665-26.864 12.21-57.191 13.022-89.597h74.879c-2.292 44.156-19.278 85.545-48.663 118.543zM334.299 235.52c-.355-13.874-1.413-27.573-3.199-40.96h71.536a193.802 193.802 0 016.578 40.96h-74.915zm136.741-61.44H61.44V51.2h409.6v122.88z" />
			</svg>
			<h1 class="noTextSelect">Domain Query</h1>
		</a>
	</header>

	<?php require_once(__DIR__ . '/nav.php'); ?>