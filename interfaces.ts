// @ts-nocheck

declare interface environmentHandle {
	port: string,
	session_secret: string,
	timezone: string,
	mysql_host: string,
	mysql_port: int,
	mysql_username: string,
	mysql_password: string
}

declare interface APIinformation {
	[name: string]: {
		gui: {
			gui: string,
			endpoint: string
		},
		ip: {
			gui: string,
			v4: string,
			v6: string
		},
		key: string,
		url: string
	},
}