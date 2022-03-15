

(async function () {

	let _cheatToolWindow = document.getElementById('cheatTool');
	let _lastKnownDay = -1;
	let _lastKnownHour = 8;
	let _validWorkCodes = [];

	function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
	}

	async function waitFor(selector) {
		let elem = document.querySelector(selector);
		while (!elem) {
			await sleep(100);
			elem = document.querySelector(selector);
		}
		await sleep(10);
		return elem;
	}
	
	async function waitForGone(selector) {
		let elem = document.querySelector(selector);
		while (elem) {
			await sleep(100);
			elem = document.querySelector(selector);
		}
	}

	function findEntryContaining(text) {
		text = text.toLowerCase();
		return [...document.querySelectorAll('.mat-option-text')].filter(elem => elem.textContent.toLowerCase().includes(text))[0];
	}
	
	function hourToTimeString(hour) {
		const ampm = hour >= 12 ? 'pm' : 'am';
		const hours = (hour > 12) ? (hour - 12) : hour;
		return `${hours}${ampm}`;
	}

	async function addNewEntry(day, code, hours) {
		console.log(`add ${day} ${code} ${hours}`);
		let elem;
		const offsetDay = day + 2;
		if (day !== _lastKnownDay) {
			_lastKnownHour = 8;
			_lastKnownDay = day;
		}
		const startHourStr = hourToTimeString(_lastKnownHour);
		_lastKnownHour += hours;
		const endHourStr = hourToTimeString(_lastKnownHour);

		// add new entry
		document.querySelector(`mat-row.cdk-row:nth-child(${offsetDay}) > mat-cell:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2)`).click();
		await waitFor('.checkmark');

		// fill in start
		elem = document.querySelector('.start-timebox-default > input');
		elem.value = startHourStr;
		elem.dispatchEvent(new Event('input', {'bubbles': true, 'cancelable': true}));

		// fill in end
		elem = document.querySelector('.end-timebox-default > input');
		elem.value = endHourStr;
		elem.dispatchEvent(new Event('input', {'bubbles': true, 'cancelable': true}));
		
		// fill in break
		elem = document.querySelector(`mat-row.cdk-row:nth-child(${offsetDay}) > mat-cell:nth-child(4) > div:nth-child(1) > div:nth-child(1) > input`);
		elem.value = '0';
		elem.dispatchEvent(new Event('input', {'bubbles': true, 'cancelable': true}));
		
		// click work code button to open dialog
		document.querySelector('.timesheetAddBillingCode').click();
		
		// bring up work code selection dropdown
		(await waitFor('form.ng-untouched > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > mat-form-field:nth-child(2) > div:nth-child(1) > div > div:nth-child(1) > div:nth-child(1)')).click();
		
		// click on work code option
		await waitFor('.ng-trigger-transformPanel');
		findEntryContaining(code).click();
		
		// click Save to close dialog
		document.querySelector('button.mat-focus-indicator:nth-child(2)').click();
		await waitFor('.checkmark > img');
		
		// NOTE: removing this to allow user to make adjustments before submission
		// submit the entry and wait for completion		
		(await waitFor('.checkmark > img'));
		// await sleep(250);
		// await waitForGone('.checkmark');
	}
	
	async function getValidWorkCodes() {		
		// add new Sunday entry
		document.querySelector(`mat-row.cdk-row:nth-child(2) > mat-cell:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2)`).click();
		
		// click work code button to open dialog
		(await waitFor('.timesheetAddBillingCode')).click();
		
		// bring up work code selection dropdown
		(await waitFor('form.ng-untouched > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > mat-form-field:nth-child(2) > div:nth-child(1) > div > div:nth-child(1) > div:nth-child(1)')).click();
		
		// get valid work codes
		_validWorkCodes = [...document.querySelectorAll('.mat-option-text')].map(elem => elem.textContent.trim()).filter(text => text !== 'None');
		
		// click Cancel to close dialog
		document.querySelector('button.mat-focus-indicator:nth-child(1)').click();
		
		// delete Sunday entry
		(await waitFor('.actions-option > div')).click();
		await waitFor('.mat-option');
		do {
			try {
				document.querySelector('.mat-option').click();
				await sleep(250);
			} catch(e) {
				// stupid animation timing thing
			}
		} while (document.querySelector('.mat-option'));
		await waitForGone('.checkmark');
		console.log('Work Codes obtained');
	}
	
	function getValidWorkCode(workCode) {
		workCode = workCode.trim().toLowerCase();
		const foundCodes = _validWorkCodes.filter(check => check.toLowerCase().includes(workCode));
		return foundCodes.length ? foundCodes[0] : false;
	}
	
	function showDialog() {
		if (_cheatToolWindow) {
			_cheatToolWindow.style.display = 'block';
			return;
		}
		
		const html = `
	<div style="position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); text-align: center; border: 1px solid black; background-color: #dcf9ed;padding: 11px;border-radius: 8px;">
    <div>RISE Cheat Tool</div>
    <div>
        <table cellspacing="4">
            <tbody>
                <tr>
                    <td><input id="code_1" type="text" value="CIP" style="width: 200px" /></td>
                    <td><input id="hours_1" type="number" value="40" style="width: 70px" /></td>
                </tr>
                <tr>
                    <td><input id="code_2" type="text" value="R&amp;D" style="width: 200px" /></td>
                    <td><input id="hours_2" type="number" value="0" style="width: 70px" /></td>
                </tr>
                <tr>
                    <td><input id="code_3" type="text" value="" style="width: 200px" /></td>
                    <td><input id="hours_3" type="number" value="0" style="width: 70px" /></td>
                </tr>
                <tr>
                    <td><input id="code_4" type="text" value="" style="width: 200px" /></td>
                    <td><input id="hours_4" type="number" value="0" style="width: 70px" /></td>
                </tr>
                <tr>
                    <td><input id="code_5" type="text" value="" style="width: 200px" /></td>
                    <td><input id="hours_5" type="number" value="0" style="width: 70px" /></td>
                </tr>
        </table>
    </div>
    <div><button id="generate">Generate</button></div>
</div>`;
		const container = document.createElement('div');
		container.id = 'cheatTool';
		container.innerHTML = html;
		document.body.appendChild(container);
		
		_cheatToolWindow = document.getElementById('cheatTool');
		
		// validate work code on blur
		for (let i = 1; i <= 5; i++) {
			const input = document.getElementById(`code_${i}`);
			input.addEventListener('blur', ev => {
				const validCode = getValidWorkCode(ev.target.value);
				if (!validCode) {
					alert(`WARNING: ${ev.target.value} is not a valid Work Code.`);
				} else {
					ev.target.value = validCode;
				}
			});
		}
		
		// digits only for input
		const integerOnlyInput = (ev) => {
			const key = event.keyCode || event.charCode;
			const val = ev.target.value.replace(/[^0-9]/g, '');
			const intVal = parseInt(val);
			
			if (val !== '') {
				ev.target.lastValue = intVal;
				ev.target.value = intVal;
			} else {
				if (key === 8) {
					ev.target.lastValue = 0;
					ev.target.value = 0;
				} else {
					ev.target.value = ev.target.lastValue;
				}
			}
		};
			
		for (let i = 1; i <= 5; i++) {
			const input = document.getElementById(`hours_${i}`);
			input.lastValue = parseInt(input.value.trim());
			
			input.addEventListener('keydown', integerOnlyInput);
			input.addEventListener('keyup', integerOnlyInput);
		}
		
		
		document.getElementById('generate').addEventListener('click', async () => {
			const workCodeHours = [];
			
			for (let i = 1; i <= 5; i++) {
				const code = getValidWorkCode(document.getElementById(`code_${i}`).value.trim().toLowerCase());
				const hours = parseInt(document.getElementById(`hours_${i}`).value.trim());
				
				if (code && hours > 0) {
					workCodeHours.push({code, hours});
				}
			}
			
			_cheatToolWindow.style.display = 'none';
			
			const workRecords = processWorkCodeHours(workCodeHours);
			if (!workRecords) {
				return;
			}
			
			for (let i = 0; i < workRecords.length; i++) {
				const record = workRecords[i];
				await addNewEntry(record.day, record.code, record.hours);
			}
			
			document.getElementById('cheatTool').remove();
		});
	}
	
	function processWorkCodeHours(workCodeHours) {
		// make sure there's at min 40 max 50 hours
		let totalHours = workCodeHours.reduce((hours, block) => { return hours + block.hours; }, 0);
		if (totalHours < 40) {
			if (!confirm(`WARNING: You have only logged ${totalHours} hours.\nIf that is correct, push OK.  If that is incorrect, push Cancel.`)) {
				showDialog();
				return false;
			}
		}
		
		if (totalHours > 55) {
			if (!confirm(`WARNING: You have only logged ${totalHours} hours.  This will be reduced to 55.\nIf that is acceptable, push OK.  Otherwise, push Cancel.`)) {
				showDialog();
				return false;
			}
			totalHours = 55;
		}
		
		const hoursToFill = [];
		for (let i = 0; i < 4 && totalHours > 0; i++) {
			const hours = Math.min(8, totalHours);
			totalHours -= hours;
			hoursToFill.push(hours);
		}
		if (totalHours > 0) {
			hoursToFill.push(totalHours);
		}
		
		// create new work records
		const workRecords = [];
		while (hoursToFill.length > 0) {
			const day = 6 - hoursToFill.length;
			const hoursLeft = hoursToFill.shift();
			const record = workCodeHours[0];
			
			if (record.hours > hoursLeft) {
				workRecords.push({day, code: record.code, hours: hoursLeft});
				record.hours -= hoursLeft;
			} else {
				workRecords.push({day, code: record.code, hours: record.hours});
				workCodeHours.shift();
				if (hoursLeft - record.hours !== 0) {
					hoursToFill.unshift(hoursLeft - record.hours);
				}
			}
		}
		
		return workRecords.sort((a, b) => b.day - a.day);
	}
	
	// run the app
	const url = 'https://platform.risepeople.com/app/#/scheduling/timesheet';
	if (window.location.href !== url) {
		alert(`WARNING: This must be used on ${url}`);
		return;
	}
	
	if (!confirm(`NOTE: Rise is finicky.  This tool works only if there are no time entries already on the list and only if you have made no additions, removals, or changes to the list.\n\nIf you're unsure, remove all the entries, refresh the page, and run this tool again.\n\nDo you want to proceed with the tool?`)) {
		return;
	}
	
	await getValidWorkCodes();
	showDialog();
})();

