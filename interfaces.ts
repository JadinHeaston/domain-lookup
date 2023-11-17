// @ts-nocheck

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

declare interface response {
    status: string,
    time: string,
    payPeriodInfo: string,
    ESSTimeData: ESSTimeData,
}