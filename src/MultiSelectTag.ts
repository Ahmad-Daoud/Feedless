// TagColor interface definition
export interface TagColor {
    textColor?: string;
    borderColor?: string;
    bgColor?: string;
}

// MultiSelectCustoms interface definition
export interface MultiSelectCustoms {
    shadow?: boolean;
    rounded?: boolean;
    placeholder?: string;
    tagColor?: TagColor;
    onChange?: (selectedValues: { label: string; value: string }[]) => void;
}

// Option interface definition
export interface Option {
    value: string;
    label: string;
    selected: boolean;
}

// MultiSelectTag class definition
export class MultiSelectTag {
    private element: HTMLSelectElement | null = null;
    private options: Option[] = [];
    private customSelectContainer: HTMLDivElement | null = null;
    private wrapper: HTMLDivElement | null = null;
    private btnContainer: HTMLDivElement | null = null;
    private body: HTMLDivElement | null = null;
    private inputContainer: HTMLDivElement | null = null;
    private inputBody: HTMLDivElement | null = null;
    private input: HTMLInputElement | null = null;
    private button: HTMLButtonElement | null = null;
    private drawer: HTMLDivElement | null = null;
    private ul: HTMLUListElement | null = null;
    private selectedValues: { label: string; value: string }[] = [];

    constructor(el: string, private customs: MultiSelectCustoms = { shadow: false, rounded: true }) {
        this.init(el);
    }

    private init(el: string): void {
        this.element = document.getElementById(el) as HTMLSelectElement;
        this.createElements();
        this.initOptions();
        this.enableItemSelection();
        this.setValues(false);

        if (this.button) {
            this.button.addEventListener('click', () => {
                if (this.drawer?.classList.contains('hidden')) {
                    this.initOptions();
                    this.enableItemSelection();
                    this.drawer.classList.remove('hidden');
                    this.input?.focus();
                } else {
                    this.drawer?.classList.add('hidden');
                }
            });
        }

        if (this.input) {
            this.input.addEventListener('keyup', (e) => {
                this.initOptions((e.target as HTMLInputElement).value);
                this.enableItemSelection();
            });

            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !this.input?.value && this.inputContainer?.childElementCount! > 1) {
                    const child = this.body?.children[this.inputContainer!.childElementCount - 2]?.firstChild as HTMLElement;
                    const option = this.options.find(op => op.value === child?.dataset.value);
                    if (option) {
                        option.selected = false;
                        this.removeTag(child.dataset.value!);
                        this.setValues();
                    }
                }
            });
        }

        window.addEventListener('click', (e) => {
            if (this.customSelectContainer && !this.customSelectContainer.contains(e.target as Node)) {
                if ((e.target as HTMLElement).nodeName !== "LI" && (e.target as HTMLElement).getAttribute("class") !== "input_checkbox") {
                    this.drawer?.classList.add('hidden');
                } else {
                    this.enableItemSelection();
                }
            }
        });
    }

    private createElements(): void {
        this.options = this.getOptions();
        this.element?.classList.add('hidden');

        this.customSelectContainer = document.createElement('div');
        this.customSelectContainer.classList.add('mult-select-tag');

        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('wrapper');

        this.body = document.createElement('div');
        this.body.classList.add('body');
        if (this.customs.shadow) {
            this.body.classList.add('shadow');
        }
        if (this.customs.rounded) {
            this.body.classList.add('rounded');
        }

        this.inputContainer = document.createElement('div');
        this.inputContainer.classList.add('input-container');

        this.input = document.createElement('input');
        this.input.classList.add('input');
        this.input.placeholder = `${this.customs.placeholder || 'Search...'}`;

        this.inputBody = document.createElement('div');
        this.inputBody.classList.add('input-body');
        this.inputBody.append(this.input);

        this.body.append(this.inputContainer);

        this.btnContainer = document.createElement('div');
        this.btnContainer.classList.add('btn-container');

        this.button = document.createElement('button');
        this.button.type = 'button';
        this.btnContainer.append(this.button);

        const icon = new DOMParser().parseFromString(
            `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 21 6 15"></polyline>
            </svg>`, 'image/svg+xml').documentElement;

        this.button.append(icon);

        this.body.append(this.btnContainer);
        this.wrapper.append(this.body);

        this.drawer = document.createElement('div');
        this.drawer.classList.add(...['drawer', 'hidden']);
        if (this.customs.shadow) {
            this.drawer.classList.add('shadow');
        }
        if (this.customs.rounded) {
            this.drawer.classList.add('rounded');
        }
        this.drawer.append(this.inputBody);

        this.ul = document.createElement('ul');
        this.drawer.appendChild(this.ul);

        this.customSelectContainer.appendChild(this.wrapper);
        this.customSelectContainer.appendChild(this.drawer);

        if (this.element?.nextSibling) {
            this.element.parentNode?.insertBefore(this.customSelectContainer, this.element.nextSibling);
        } else {
            this.element?.parentNode?.appendChild(this.customSelectContainer);
        }
    }

    private createElementInSelectList(option: Option, val: string | null, selected = false): void {
        const li = document.createElement('li');
        li.innerHTML = "<input type='checkbox' style='margin:0 0.5em 0 0' class='input_checkbox'>"; 
        li.innerHTML += option.label;
        li.dataset.value = option.value;
        const checkbox = li.firstChild as HTMLInputElement;
        checkbox.dataset.value = option.value;

        if (val && option.label.toLowerCase().startsWith(val.toLowerCase())) {
            this.ul?.appendChild(li);
        } else if (!val) {
            this.ul?.appendChild(li);
        }

        if (selected) {
            li.style.backgroundColor = this.customs.tagColor?.bgColor || '#FFE9E2';
            checkbox.checked = true;
        }
    }

    private initOptions(val: string | null = null): void {
        if (this.ul) this.ul.innerHTML = '';
        for (let option of this.options) {
            if (option.selected) {
                !this.isTagSelected(option.value) && this.createTag(option);
                this.createElementInSelectList(option, val, true);
            } else {
                this.createElementInSelectList(option, val);
            }
        }
    }

    private createTag(option: Option): void {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item-container');
        itemDiv.style.color = this.customs.tagColor?.textColor || '#FF5D29';
        itemDiv.style.borderColor = this.customs.tagColor?.borderColor || '#FF5D29';
        itemDiv.style.background = this.customs.tagColor?.bgColor || '#FFE9E2';

        const itemLabel = document.createElement('div');
        itemLabel.classList.add('item-label');
        itemLabel.style.color = this.customs.tagColor?.textColor || '#FF5D29';
        itemLabel.innerHTML = option.label;
        itemLabel.dataset.value = option.value;

        const itemClose = new DOMParser().parseFromString(
            `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>`, 'image/svg+xml').documentElement;

        itemClose.addEventListener('click', () => {
            const unselectOption = this.options.find(op => op.value === option.value);
            if (unselectOption) {
                unselectOption.selected = false;
                this.removeTag(option.value);
                this.initOptions();
                this.setValues();
            }
        });

        itemDiv.appendChild(itemLabel);
        itemDiv.appendChild(itemClose);
        this.inputContainer?.append(itemDiv);
    }

    private enableItemSelection(): void {
        if (this.ul) {
            for (let li of this.ul.children) {
                li.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    const option = this.options.find(o => o.value === target.dataset.value);
                    if (option) {
                        if (!option.selected) {
                            option.selected = true;
                            this.createTag(option);
                            this.setValues();
                        } else {
                            option.selected = false;
                            this.removeTag(option.value);
                            this.setValues();
                        }
                    }
                });
            }
        }
    }
    public appendSelectElement(selectElement: HTMLSelectElement): void {
        this.customSelectContainer?.appendChild(selectElement);
    }
    public get container(): HTMLDivElement | null {
        return this.customSelectContainer;
    }
    private setValues(set: boolean = true): void {
        this.selectedValues = this.options.filter(o => o.selected).map(o => ({ label: o.label, value: o.value }));
        if (set) this.element!.value = this.selectedValues.map(o => o.value).join(',');
        if (this.customs.onChange) this.customs.onChange(this.selectedValues);
    }

    private removeTag(value: string): void {
        const child = Array.from(this.inputContainer!.children).find(c => (c.firstChild as HTMLElement).dataset.value === value);
        if (child) {
            this.inputContainer!.removeChild(child);
        }
    }

    private getOptions(): Option[] {
        return Array.from(this.element!.options).map(option => ({
            value: option.value,
            label: option.text,
            selected: option.selected
        }));
    }

    private isTagSelected(value: string): boolean {
        return Array.from(this.inputContainer!.children).some(child => (child.firstChild as HTMLElement).dataset.value === value);
    }
}
