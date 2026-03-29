const inputs = Array.from(document.querySelectorAll('.inputs input'));
const messageEl = document.getElementById('message');
const trycountEl = document.getElementById('trycount');

function focusAndSelect(input) {
    if (!input || input.disabled) return;
    input.focus();
    input.select();
}

function clearInputs() {
    inputs.forEach((input) => {
        input.value = '';
    });
}

function setMessage(text, isSuccess) {
    messageEl.textContent = text;
    messageEl.classList.toggle('is-success', Boolean(isSuccess));
}

function setInputsDisabled(disabled) {
    inputs.forEach((input) => {
        input.disabled = disabled;
        if (!disabled) input.value = '';
    });

    if (!disabled) {
        focusAndSelect(inputs[0]);
    }
}

function updateTryCount(tryCount) {
    const display = Math.min(tryCount, 5);

    if (tryCount >= 0) {
        trycountEl.textContent = `Attempts made: ${display}`;
    } else {
        trycountEl.textContent = '';
    }

    if (tryCount >= 5) {
        setMessage('Ring 0797 999 7237', false);
        setInputsDisabled(true);
    }
}

function handleResetMessage(resetMessage) {
    const match = /^reset-(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(resetMessage);
    if (!match) return;

    const [, year, month, day] = match;
    const now = new Date();
    const today = [
        String(now.getFullYear()),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
    ].join('-');

    const incomingDate = [
        year,
        String(month).padStart(2, '0'),
        String(day).padStart(2, '0')
    ].join('-');

    if (today !== incomingDate) return;

    setInputsDisabled(false);
    trycountEl.textContent = 'Attempts made: 0';
    setMessage('', false);
}

function submitCode() {
    const code = inputs.map((input) => input.value).join('');
    if (code.length !== inputs.length) return;

    fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    })
        .then((response) => response.json())
        .then((payload) => {
            if (payload.message) {
                setMessage(payload.message, false);
                return;
            }

            clearInputs();
            focusAndSelect(inputs[0]);
        })
        .catch(() => {
            setMessage('Network error - try again', false);
        });
}

function moveCursorOrSubmit(input) {
    if (input.disabled || !input.value) return;

    const nextInput = input.nextElementSibling;
    if (nextInput && nextInput.tagName === 'INPUT') {
        focusAndSelect(nextInput);
        return;
    }

    submitCode();
}

function connectEvents() {
    const eventSource = new EventSource('/events');

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.tryCount !== undefined) {
            updateTryCount(data.tryCount);
        }

        if (data.resetMessage !== undefined) {
            handleResetMessage(data.resetMessage);
        }

        if (data.status === 'OK') {
            setMessage('Box opened. Deposit parcel and close box firmly.', true);
            setInputsDisabled(true);
        } else if (data.status !== undefined) {
            messageEl.classList.remove('is-success');
        }
    };
}

inputs.forEach((input) => {
    input.addEventListener('focus', () => focusAndSelect(input));
    input.addEventListener('input', () => moveCursorOrSubmit(input));

    input.addEventListener('keydown', (event) => {
        if (input.disabled) return;

        if (event.key === 'Backspace' && input.value === '') {
            const prev = input.previousElementSibling;
            if (prev && prev.tagName === 'INPUT') {
                event.preventDefault();
                prev.value = '';
                focusAndSelect(prev);
            }
        }

        if (event.key === 'ArrowLeft') {
            const prev = input.previousElementSibling;
            if (prev && prev.tagName === 'INPUT') {
                event.preventDefault();
                focusAndSelect(prev);
            }
        }

        if (event.key === 'ArrowRight') {
            const next = input.nextElementSibling;
            if (next && next.tagName === 'INPUT') {
                event.preventDefault();
                focusAndSelect(next);
            }
        }
    });
});

connectEvents();
focusAndSelect(inputs[0]);
