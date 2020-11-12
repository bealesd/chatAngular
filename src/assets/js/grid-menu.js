GridMenu = function () {
    class GridMenu {
        UP_ARROW = '&#x25BA;';
        DOWN_ARROW = '&#9660;';

        constructor() {
            this.ready = false;
            this.onReadyCallbacks = [];

            this.clickCallbacks = {};
            this.onMouseOverCallback = {};
            this.onMouseLeaveCallback = {};

            this.menuItems = [];
            this.subMenuItems = [];
            this.childMenuItems = [];
            this.subMenuContainers = [];
            this.menuBorder = '1px solid black';

            // const href = 'src/asset/css/grid-menu.css';
            // this.loadCss(href);
        }

        loadCss(href) {
            const link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.media = "screen,print";
            link.href = href;
            document.querySelector("head").appendChild(link);
        }

        registerCallback = (callback) => this.onReadyCallbacks.push(callback);

        load() {
            return new Promise((resolve, reject) => {
                try {
                    this.body = document.querySelector('body');

                    this.enableRollback();

                    this.flatternMenu();

                    this.menuItems = this.getMenuItemsDom();
                    this.subMenuItems = this.getSubMenuItemsDom();
                    this.childMenuItems = this.getChildMenuItemsDom();

                    this.removeIntialMenuHtml();

                    this.moveBodyContent();

                    this.moveMenuToContainer();
                    this.positionMenuItems();

                    this.moveMenuChildrenToContainers();

                    this.subMenuContainers = this.getSubMenuContainersDom();

                    this.positionSubMenuItems();
                    this.positionChildMenuItems();

                    this.createSubmMenuExpanders();

                    this.addSubMenuBorders();
                    this.addChildMenuBorders();

                    this.onMenuClick();
                    this.onSubMenuClick();

                    this.onOffMenuClick();

                    this.onMenuItemsHover();

                    this.onReadyCallbacks.forEach(cb => cb());
                    this.ready = true;
                    resolve();
                } catch (error) {
                    this.rollback();
                    reject();
                }
            })
        }

        //#region GETTERS
        getChildMenuItems(args) {
            let delegate;

            if (!Object.keys(args).includes('menuCol'))
                return [];
            else if (!Object.keys(args).includes('subMenuRow'))
                delegate = child => child.menuCol === parseInt(args.menuCol);
            else if (!Object.keys(args).includes('childRow'))
                delegate = child => child.menuCol === parseInt(args.menuCol) && child.subMenuRow === parseInt(args.subMenuRow);
            else
                delegate = child => child.menuCol === parseInt(args.menuCol) && child.subMenuRow === parseInt(args.subMenuRow) && child.childMenuRow === parseInt(args.childRow);

            return this.childMenuItems.filter(delegate);
        }

        getSubMenuItems(args) {
            let delegate;

            if (!Object.keys(args).includes('menuCol'))
                return [];
            else if (!Object.keys(args).includes('subMenuRow'))
                delegate = subMenuItem => subMenuItem.menuCol === parseInt(args.menuCol);
            else
                delegate = subMenuItem => subMenuItem.menuCol === parseInt(args.menuCol) && subMenuItem.subMenuRow === parseInt(args.subMenuRow);

            return this.subMenuItems.filter(delegate);
        }

        getMenuItem(args) {
            if (!Object.keys(args).includes('menuCol'))
                return [];
            else
                return this.menuItems.find(menuitem => menuitem.menuCol === args.menuCol);
        }

        getSubAndChildMenuItems = (menuCol) => [...this.subMenuItems.filter(subItem => subItem.menuCol === menuCol), ...this.childMenuItems.filter(childItem => childItem.menuCol === menuCol)];

        getMenuItemsAll = () => [...this.menuItems, ...this.subMenuItems, ...this.childMenuItems];

        getSubMenuContainer = (menuCol) => this.subMenuContainers.find(container => container.menuCol === menuCol);

        getSubMenuItemChildren = (subMenuItem) => this.childMenuItems.filter(x => x.menuCol === subMenuItem.menuCol && x.subMenuRow === subMenuItem.subMenuRow);

        getMenuItemsDom = () => {
            const menuItems = [];
            document.querySelectorAll('.gm-menu').forEach((menu) => {
                menuItems.push({
                    'html': menu,
                    'menuCol': parseInt(menu.dataset.menuCol),
                    'showChildren': false
                });
            });
            return menuItems;
        }

        getSubMenuItemsDom = () => {
            const subMenuItems = [];
            document.querySelectorAll('.gm-sub-menu-item').forEach((subMenuItem) => {
                subMenuItems.push({
                    'html': subMenuItem,
                    'menuCol': parseInt(subMenuItem.dataset.menuCol),
                    'subMenuRow': parseInt(subMenuItem.dataset.subMenuRow)
                });
            });
            return subMenuItems;
        }

        getChildMenuItemsDom = () => {
            const childMenuItems = [];
            document.querySelectorAll('.gm-child-menu-item').forEach((childMenuItem) => {
                childMenuItems.push({
                    'childMenuRow': parseInt(childMenuItem.dataset.childMenuRow),
                    'subMenuRow': parseInt(childMenuItem.dataset.subMenuRow),
                    'menuCol': parseInt(childMenuItem.dataset.menuCol),
                    'html': childMenuItem,
                    'shown': false
                });
            });
            return childMenuItems;
        }

        getSubMenuContainersDom = () => {
            const subMenuContainers = [];
            [...document.querySelectorAll(`.gm-sub-menu-container`)].forEach((container) => {
                subMenuContainers.push({
                    'menuCol': parseInt(container.dataset.menuCol),
                    'html': container
                });
            });
            return subMenuContainers;
        }

        getIntialMenuItemsDom = () => {
            if (document.querySelector('.gm-container') === null) return [];

            const menuItems = [];
            [...document.querySelector('.gm-container').children].forEach((menu, menuCol) => {
                menuItems.push({
                    'html': menu,
                    'menuCol': menuCol + 1
                });
            });
            return menuItems;
        }

        getInitialSubMenuItemsDom = () => {
            const subMenuItems = [];
            this.getIntialMenuItemsDom().forEach((menuItem) => {
                [...menuItem.html.children].forEach((subMenuItem, subMenuRow) => {
                    subMenuItems.push({
                        'menuCol': menuItem.menuCol,
                        'html': subMenuItem,
                        'subMenuRow': subMenuRow + 1
                    });
                });
            });
            return subMenuItems;
        }

        getInitialChildMenuItems = () => {
            const childMenuItems = [];
            const subMenuItems = this.getInitialSubMenuItemsDom();

            subMenuItems.forEach((subMenuItem) => {
                [...subMenuItem.html.children].forEach((childMenuItem, childMenuRow) => {
                    childMenuItems.push({
                        'childMenuRow': childMenuRow + 1,
                        'subMenuRow': subMenuItem.subMenuRow,
                        'menuCol': subMenuItem.menuCol,
                        'html': childMenuItem
                    });
                });
            });
            return childMenuItems;
        }
        //#region 

        enableRollback() {
            this.rollbackHtml = document.querySelector('.gm-container').outerHTML;
        }

        rollback() {
            document.querySelectorAll('[class*="gm"],[id*="gm"]').forEach(gm => gm.remove());

            this.promoteChildren(document.querySelector('#bodyContent'));

            this.menuItems = [];
            this.subMenuItems = [];
            this.childMenuItems = [];
            this.subMenuContainers = [];

            this.insertContent(this.body, 0, this.rollbackHtml);
        }

        flatternMenu() {
            this.getIntialMenuItemsDom().forEach((menuItem) => {
                const div = document.createElement('div');
                div.classList.add('gm-menu');
                div.dataset.menuCol = menuItem.menuCol;
                if (menuItem.html.id) div.id = menuItem.html.id;
                div.innerHTML = menuItem.html.dataset.value;
                this.insertContent(this.body, 0, div);
            });

            this.getInitialSubMenuItemsDom().forEach((subMenuItem) => {
                const div = document.createElement('div');
                div.classList.add('gm-sub-menu-item');
                div.dataset.menuCol = subMenuItem.menuCol;
                div.dataset.subMenuRow = subMenuItem.subMenuRow;
                if (subMenuItem.html.id) div.id = subMenuItem.html.id;
                div.innerHTML = subMenuItem.html.dataset.value;
                this.insertContent(this.body, 0, div);
            });

            this.getInitialChildMenuItems().forEach((childMenuItem) => {
                const div = document.createElement('div');
                div.classList.add('gm-child-menu-item');
                div.dataset.subMenuRow = childMenuItem.subMenuRow;
                div.dataset.menuCol = childMenuItem.menuCol;
                div.dataset.childMenuRow = childMenuItem.childMenuRow;
                if (childMenuItem.html.id) div.id = childMenuItem.html.id;
                div.innerHTML = childMenuItem.html.dataset.value;
                this.insertContent(this.body, 0, div);
            });
        }

        removeIntialMenuHtml = () => document.querySelector('.gm-container').remove();

        moveBodyContent() {
            const bodyContent = document.createElement('div');
            bodyContent.id = 'bodyContent';

            [...this.body.children].forEach((child, index) => {
                if (child.nodeName.toLowerCase() !== 'script')
                    this.insertContent(bodyContent, index, child)
            });
            this.insertContent(this.body, 0, bodyContent);
        }

        moveMenuToContainer() {
            const div = document.createElement('div');
            div.id = 'gm-menu-container';
            div.style.gridTemplateColumns = `repeat(${this.menuItems.length}, min-content)`;
            this.menuItems.forEach((menu) => {
                menu.html.style.gridRow = `1 / span 1`;
                menu.html.style.gridColumn = `${menu.menuCol} / span 1`;
                this.insertContent(div, menu.menuCol - 1, menu.html);
            });
            this.insertContent(this.body, 0, div);
        }

        addSubMenuBorders() {
            const subMenuGroups = this.countSubMenuMenuItemsInGroup();
            subMenuGroups.forEach((subMenuGroup) => {
                const lastRow = this.getSubMenuItems({ 'menuCol': subMenuGroup.menuCol, 'subMenuCol': subMenuGroup.rowCount })[0];
                lastRow.html.style.borderBottom = this.menuBorder;
            });
        }

        countChildMenuItemsInGroup() {
            const childMenuRowCountPerGroup = [];
            this.childMenuItems.forEach((childMenuItem) => {
                const childMenuGroup = childMenuRowCountPerGroup.find(r => r.menuCol === childMenuItem.menuCol && r.subMenuRow === childMenuItem.subMenuRow) ?? false;
                if (!childMenuGroup) {
                    childMenuRowCountPerGroup.push({
                        'menuCol': childMenuItem.menuCol,
                        'subMenuRow': childMenuItem.subMenuRow,
                        'rowCount': 1
                    })
                } else childMenuGroup.rowCount++;
            });
            return childMenuRowCountPerGroup;
        }

        countSubMenuMenuItemsInGroup() {
            const subMenuRowCountPerGroup = [];
            this.subMenuItems.forEach((subMenuItem) => {
                const subMenuGroup = subMenuRowCountPerGroup.find(r => r.menuCol === subMenuItem.menuCol) ?? false;
                if (!subMenuGroup) {
                    subMenuRowCountPerGroup.push({
                        'menuCol': subMenuItem.menuCol,
                        'rowCount': 1
                    })
                } else subMenuGroup.rowCount++;
            });
            return subMenuRowCountPerGroup;
        }

        addChildMenuBorders() {
            const childMenuRowCountPerGroup = this.countChildMenuItemsInGroup();
            const subMenuRowCountPerGroup = this.countSubMenuMenuItemsInGroup();

            childMenuRowCountPerGroup.forEach((childGroup) => {
                const relMaxChildRow = (childGroup.subMenuRow - 1) + childGroup.rowCount;
                const maxSubMenuRow = subMenuRowCountPerGroup.find(subMenuGroup => subMenuGroup.menuCol === childGroup.menuCol).rowCount;

                if (relMaxChildRow > maxSubMenuRow) {
                    let unboundChildRowsCount = relMaxChildRow - maxSubMenuRow;
                    for (let rowIndexFromEnd = 0; rowIndexFromEnd < unboundChildRowsCount; rowIndexFromEnd++) {
                        let undboundChildRow = childGroup.rowCount - rowIndexFromEnd;
                        const childItem = this.getChildMenuItems({ 'menuCol': childGroup.menuCol, 'subMenuRow': childGroup.subMenuRow, 'childRow': undboundChildRow })[0];
                        childItem.html.style.borderLeft = this.menuBorder;
                        childItem.html.style.marginLeft = '-1px';
                    }
                }

                if (childGroup.subMenuRow !== 1) {
                    const firstChildItem = this.getChildMenuItems({ 'menuCol': childGroup.menuCol, 'subMenuRow': childGroup.subMenuRow, 'childRow': 1 })[0];
                    firstChildItem.html.style.borderTop = this.menuBorder;
                }

                const lastChildItem = this.getChildMenuItems({ 'menuCol': childGroup.menuCol, 'subMenuRow': childGroup.subMenuRow, 'childRow': childGroup.rowCount })[0];
                lastChildItem.html.style.borderBottom = this.menuBorder;
            });
        }

        positionMenuItems() {
            this.menuItems.forEach((menu) => {
                menu.html.style.gridRow = `1 / span 1`;
                menu.html.style.gridColumn = `${menu.menuCol} / span 1`;
            });
        }

        positionSubMenuItems() {
            this.subMenuItems.forEach((subMenuItem) => {
                subMenuItem.html.style.gridRow = `${subMenuItem.subMenuRow} / span 1`;
                subMenuItem.html.style.gridColumn = `1 / span 1`;
                subMenuItem.html.style.display = 'grid';
                subMenuItem.html.style.gridTemplateColumns = 'auto 10px';

                const div = document.createElement('div');

                div.innerHTML = subMenuItem.html.innerHTML;
                subMenuItem.html.innerHTML = '';

                this.insertContent(subMenuItem.html, 0, div);
            });
        }

        positionChildMenuItems() {
            this.childMenuItems.forEach((childMenuItem) => {
                const row = childMenuItem.subMenuRow + childMenuItem.childMenuRow - 1;
                childMenuItem.html.style.gridRow = `${row} / span 1`;
                childMenuItem.html.style.gridColumn = `2 / span 1`;
                childMenuItem.html.classList.add('gm-hidden');
            });
        }

        onMenuClick() { //should be called register event lsistener, and that should call handle event method
            this.menuItems.forEach((menu) => {
                menu.html.addEventListener('click', () => {
                    if (menu.html.classList.contains('gm-disabled')) return;

                    const showMenu = !menu.showChildren;
                    this.hideMenu();

                    if (!showMenu) {
                        menu.showChildren = false;
                    } else if (showMenu) {
                        this.showSubMenu(menu.menuCol);
                        menu.showChildren = true;
                    }
                });
            });
        }

        onOffMenuClick() {
            document.querySelector('#bodyContent').addEventListener('click', () => this.hideMenu());

            this.subMenuContainers.forEach((container) => {
                container.html.addEventListener('click', (evt) => {
                    const menuItem = evt.path.find(dom => dom.nodeName === "DIV" && (dom.classList.contains("gm-sub-menu-item") || dom.classList.contains("gm-child-menu-item"))) ?? false;

                    if (!menuItem) return this.hideMenu();
                    else if (menuItem.classList.contains("gm-sub-menu-item")) return;
                    else if (!this.getChildMenuItems({ ...menuItem.dataset })[0].shown) return this.hideMenu();
                    else return;
                });
            })
        }

        onMenuItemsHover() {
            const allMenuItems = this.getMenuItemsAll();
            allMenuItems.forEach((childItem) => {
                const html = childItem.html;
                const cbMouseOver = () => { html.classList.add('menu-item-hover'); }
                const cbMouseLeave = () => { html.classList.remove('menu-item-hover'); }

                if (html.id !== '') {
                    this.onMouseOverCallback[html.id] = cbMouseOver;
                    this.onMouseLeaveCallback[html.id] = cbMouseLeave;
                }

                html.addEventListener('mouseover', cbMouseOver);
                html.addEventListener('mouseleave', cbMouseLeave);
            });
        }

        disableMenuItem(id) {
            const allMenuItems = this.getMenuItemsAll();
            const el = allMenuItems.find(item => item.html.id === id).html;

            if (this.clickCallbacks.hasOwnProperty(id)) {
                this.clickCallbacks[id].forEach((cb) => { el.removeEventListener('click', cb) });
                this.clickCallbacks[id] = [];
            }
            if (this.onMouseOverCallback.hasOwnProperty(id))
                el.removeEventListener('mouseover', this.onMouseOverCallback[id]);
            if (this.onMouseLeaveCallback.hasOwnProperty(id))
                el.removeEventListener('mouseleave', this.onMouseLeaveCallback[id]);

            el.classList.remove('menu-item-hover')
            el.classList.add('gm-disabled');
        }

        enableMenuItem(id) {
            const allMenuItems = this.getMenuItemsAll();
            const el = allMenuItems.find(item => item.html.id === id).html;
            el.classList.remove('gm-disabled');
            el.addEventListener('mouseleave', this.onMouseLeaveCallback[id]);
            el.addEventListener('mouseover', this.onMouseOverCallback[id]);
        }

        addMenuItemClickEvent(id, callback) {
            if (!this.clickCallbacks.hasOwnProperty(id)) this.clickCallbacks[id] = [];

            const allMenuItems = this.getMenuItemsAll();
            const el = allMenuItems.find(item => item.html.id === id).html;

            const cb = () => { if (!el.classList.contains('gm-disabled')) callback(); }
            this.clickCallbacks[id].push(cb);
            el.addEventListener('click', cb);
        }

        // alternative to hideMenu
        closeMenu() {
            document.querySelectorAll('.gm-sub-menu-container').forEach((container) => {
                if (!container.classList.contains('gm-hidden'))
                    container.classList.add('gm-hidden');
            });
            this.menuItems.forEach(menu => menu.showChildren = false);
        }

        hideMenu() {
            this.hideSubMenus();
            this.hideChildMenuItems();
            this.menuItems.forEach(menu => menu.showChildren = false);
        }

        hideSubMenus() {
            this.subMenuContainers.forEach((container) => {
                container.html.style.zIndex = -1;
                container.html.classList.add('gm-hidden');
            });
        }

        showSubMenu(menuCol) {
            const container = this.getSubMenuContainer(menuCol);
            container.html.style.zIndex = 12;
            container.html.classList.remove('gm-hidden');
        }

        isSunMenuOpen = (subMenuItem) => subMenuItem.html.querySelector('span').classList.contains('down');

        subMenuItemHasChidlren = (subMenuItem) => this.getSubMenuItemChildren(subMenuItem).length > 0;

        hideChildMenuItems = () => this.subMenuItems.forEach((subMenuItem) => this.hideSubMenuItemChildren(subMenuItem));


        hideSubMenuItemChildren(subMenuItem) {
            if (!this.subMenuItemHasChidlren(subMenuItem)) return;

            const subMenuSpan = subMenuItem.html.querySelector('span');
            subMenuSpan.classList.add('up');
            subMenuSpan.classList.remove('down');
            subMenuSpan.innerHTML = this.UP_ARROW;

            this.getSubMenuItemChildren(subMenuItem).forEach(childItem => childItem.html.classList.add('gm-hidden'));
        }

        hideOtherSubMenuItemChildren = (subMenuItem) => this.subMenuItems.forEach(item => (item.html !== subMenuItem.html) && this.hideSubMenuItemChildren(item));

        showSubMenuItemChildren(subMenuItem) {
            if (subMenuItem.html.classList.contains('gm-disabled')) return;

            if (!this.subMenuItemHasChidlren(subMenuItem)) return;

            const subMenuSpan = subMenuItem.html.querySelector('span');
            subMenuSpan.classList.add('down');
            subMenuSpan.classList.remove('up');

            subMenuSpan.innerHTML = this.DOWN_ARROW;
            subMenuSpan.id = 'gm-span';

            this.getSubMenuItemChildren(subMenuItem).forEach((childItem) => {
                childItem.html.classList.remove('gm-hidden');
                childItem.shown = true;
            });
        }

        createSubmMenuExpanders = () =>
            this.subMenuItems.forEach(subMenuItem => this.subMenuItemHasChidlren(subMenuItem) &&
                this.insertContent(subMenuItem.html, 1, `<span id="gm-span" class="up">${this.UP_ARROW}</span>`))

        onSubMenuClick() {
            this.subMenuItems.forEach((subMenuItem) => {
                if (!this.subMenuItemHasChidlren(subMenuItem)) return;
                subMenuItem.html.addEventListener('click', () => {
                    this.hideOtherSubMenuItemChildren(subMenuItem);
                    if (this.isSunMenuOpen(subMenuItem)) this.hideSubMenuItemChildren(subMenuItem);
                    else this.showSubMenuItemChildren(subMenuItem);
                });
            });
        }

        moveMenuChildrenToContainers() {
            for (let menuCol = 1; menuCol <= this.menuItems.length; menuCol++) {
                const menuItem = this.getMenuItem({ 'menuCol': menuCol });

                const subAndChildMenuItems = this.getSubAndChildMenuItems(menuCol);

                const div = document.createElement('div');
                div.dataset.menuCol = menuCol;
                div.className = 'gm-sub-menu-container gm-hidden';
                div.style.left = `${menuItem.html.offsetLeft}px`;

                subAndChildMenuItems.forEach(childItem => div.appendChild(childItem.html));

                this.insertContent(this.body, menuCol - 1, div);
            }
        }

        // TODO Fix
        // add html into the parents children
        // if html is string, convert to a html
        insertContent(parentElement, position, htmlElement) {
            if (!this.isHtmlELement(htmlElement) && !this.isString(htmlElement))
                return;

            if (!this.isHtmlELement(htmlElement) && this.isString(htmlElement)) {
                const innerHtml = htmlElement;
                htmlElement = document.createElement('div');
                htmlElement.innerHTML = innerHtml;
                htmlElement = htmlElement.children[0];
            }

            if (parentElement.children.length === 0)
                parentElement.append(htmlElement);
            else if (position === 0)
                parentElement.children[0].insertAdjacentElement('beforeBegin', htmlElement);
            else if (position > 0 && position > parentElement.children.length)
                parentElement.lastChild.insertAdjacentElement('afterEnd', htmlElement);
            else
                parentElement.children[position - 1].insertAdjacentElement('afterEnd', htmlElement);
        }

        promoteChildren = (elem) => (elem !== null && elem !== undefined) ? elem.replaceWith(...elem.childNodes) : '';

        isHtmlELement = (value) =>
            (Object.prototype.toString.call(value).includes('[object HTML') &&
                Object.prototype.toString.call(value).includes('Element]')) ||
            value instanceof HTMLElement;

        isString = (value) => Object.prototype.toString.call(value) === '[object String]';

        getCssProp = (prop) => getComputedStyle(this.body.parentElement).getPropertyValue(`--${prop}`);

        getPixelCssProp = (prop) => this.pixelToNumber(this.getCssProp(prop));

        pixelToNumber = (pixel) => parseInt(pixel.trim().split('px')[0]);

        vh = (viewHeight) => viewHeight * (Math.max(document.documentElement.clientHeight, window.innerHeight || 0)) / 100;

        vw = (viewWidth) => viewWidth * (Math.max(document.documentElement.clientWidth, window.innerWidth || 0)) / 100;
    }
    return new GridMenu();
}()