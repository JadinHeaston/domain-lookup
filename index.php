<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


require_once(__DIR__ . '/includes/loader.php');

require_once(__DIR__ . '/templates/header.php');
require_once(__DIR__ . '/templates/nav.php');

?>
<main>
	<form id="main-form" method="get" action="/query/" hx-get="/query/main/" hx-target="main" hx-push-url="true">
		<h2 class="noTextSelect" id="main-header"><label>Query</label></h2>
		<div id="main-search-container">
			<input type="text" id="main-search" name="query" placeholder="example.com" title="Input a domain or IPv4 address." <?php echo INPUT_ATTRIBUTES; ?>><input type="submit" value="GO">
		</div>
	</form>

	<ul id="api-list">
		<li>
			<h3>
				<a href="https://urlscan.io/">urlscan.io</a>
			</h3>
			<form action="/query/urlscan.io/">
				<label>
					<a href="https://urlscan.io/">Search</a>
					<div><input type="text" name="query" placeholder="example.com" title="Input a domain or IPv4 address." <?php echo INPUT_ATTRIBUTES; ?>><input type="submit" value="GO"></div>
				</label>
			</form>
		</li>
		<li>
			<h3>
				<a href="https://www.virustotal.com/gui/home/search">Virus Total</a>
			</h3>
			<form action="/query/virus-total/">
				<label>
					<a href="` + api[[Object.keys(api)[0]]].dns.gui + `">Search</a>
					<div><input type="text" name="query" placeholder="example.com" title="Input a domain or IPv4 address." <?php echo INPUT_ATTRIBUTES; ?>><input type="submit" value="GO"></div>
				</label>
			</form>
		</li>
		<li>
			<h3>
				<a href="https://whois.arin.net/ui/">WHOIS (ARIN)</a>
			</h3>
			<form action="/query/whois-arin/">
				<label>
					<a href="https://whois.arin.net/ui/">Search</a>
					<div><input type="text" name="domain-query" placeholder="example.com" title="Input a domain or IPv4 address."><input type="submit" value="GO"></div>
				</label>
			</form>
		</li>
	</ul>
</main>
<?php

require_once(__DIR__ . '/templates/footer.php');
