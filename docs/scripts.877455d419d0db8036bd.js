GridMenu=new class{UP_ARROW="&#x25BA;";DOWN_ARROW="&#9660;";constructor(){this.ready=!1,this.onReadyCallbacks=[],this.clickCallbacks={},this.onMouseOverCallback={},this.onMouseLeaveCallback={},this.menuItems=[],this.subMenuItems=[],this.childMenuItems=[],this.subMenuContainers=[],this.menuBorder="1px solid black"}loadCss(e){const t=document.createElement("link");t.type="text/css",t.rel="stylesheet",t.media="screen,print",t.href=e,document.querySelector("head").appendChild(t)}registerCallback=e=>this.onReadyCallbacks.push(e);load(){return new Promise(((e,t)=>{try{this.body=document.querySelector("body"),this.enableRollback(),this.flatternMenu(),this.menuItems=this.getMenuItemsDom(),this.subMenuItems=this.getSubMenuItemsDom(),this.childMenuItems=this.getChildMenuItemsDom(),this.removeIntialMenuHtml(),this.moveBodyContent(),this.moveMenuToContainer(),this.positionMenuItems(),this.moveMenuChildrenToContainers(),this.subMenuContainers=this.getSubMenuContainersDom(),this.positionSubMenuItems(),this.positionChildMenuItems(),this.createSubmMenuExpanders(),this.addSubMenuBorders(),this.addChildMenuBorders(),this.onMenuClick(),this.onSubMenuClick(),this.onOffMenuClick(),this.onMenuItemsHover(),this.onReadyCallbacks.forEach((e=>e())),this.ready=!0,e()}catch(n){this.rollback(),t()}}))}getChildMenuItems(e){let t;return Object.keys(e).includes("menuCol")?(t=Object.keys(e).includes("subMenuRow")?Object.keys(e).includes("childRow")?t=>t.menuCol===parseInt(e.menuCol)&&t.subMenuRow===parseInt(e.subMenuRow)&&t.childMenuRow===parseInt(e.childRow):t=>t.menuCol===parseInt(e.menuCol)&&t.subMenuRow===parseInt(e.subMenuRow):t=>t.menuCol===parseInt(e.menuCol),this.childMenuItems.filter(t)):[]}getSubMenuItems(e){let t;return Object.keys(e).includes("menuCol")?(t=Object.keys(e).includes("subMenuRow")?t=>t.menuCol===parseInt(e.menuCol)&&t.subMenuRow===parseInt(e.subMenuRow):t=>t.menuCol===parseInt(e.menuCol),this.subMenuItems.filter(t)):[]}getMenuItem(e){return Object.keys(e).includes("menuCol")?this.menuItems.find((t=>t.menuCol===e.menuCol)):[]}getSubAndChildMenuItems=e=>[...this.subMenuItems.filter((t=>t.menuCol===e)),...this.childMenuItems.filter((t=>t.menuCol===e))];getMenuItemsAll=()=>[...this.menuItems,...this.subMenuItems,...this.childMenuItems];getSubMenuContainer=e=>this.subMenuContainers.find((t=>t.menuCol===e));getSubMenuItemChildren=e=>this.childMenuItems.filter((t=>t.menuCol===e.menuCol&&t.subMenuRow===e.subMenuRow));getMenuItemsDom=()=>{const e=[];return document.querySelectorAll(".gm-menu").forEach((t=>{e.push({html:t,menuCol:parseInt(t.dataset.menuCol),showChildren:!1})})),e};getSubMenuItemsDom=()=>{const e=[];return document.querySelectorAll(".gm-sub-menu-item").forEach((t=>{e.push({html:t,menuCol:parseInt(t.dataset.menuCol),subMenuRow:parseInt(t.dataset.subMenuRow)})})),e};getChildMenuItemsDom=()=>{const e=[];return document.querySelectorAll(".gm-child-menu-item").forEach((t=>{e.push({childMenuRow:parseInt(t.dataset.childMenuRow),subMenuRow:parseInt(t.dataset.subMenuRow),menuCol:parseInt(t.dataset.menuCol),html:t,shown:!1})})),e};getSubMenuContainersDom=()=>{const e=[];return[...document.querySelectorAll(".gm-sub-menu-container")].forEach((t=>{e.push({menuCol:parseInt(t.dataset.menuCol),html:t})})),e};getIntialMenuItemsDom=()=>{if(null===document.querySelector(".gm-container"))return[];const e=[];return[...document.querySelector(".gm-container").children].forEach(((t,n)=>{e.push({html:t,menuCol:n+1})})),e};getInitialSubMenuItemsDom=()=>{const e=[];return this.getIntialMenuItemsDom().forEach((t=>{[...t.html.children].forEach(((n,s)=>{e.push({menuCol:t.menuCol,html:n,subMenuRow:s+1})}))})),e};getInitialChildMenuItems=()=>{const e=[];return this.getInitialSubMenuItemsDom().forEach((t=>{[...t.html.children].forEach(((n,s)=>{e.push({childMenuRow:s+1,subMenuRow:t.subMenuRow,menuCol:t.menuCol,html:n})}))})),e};enableRollback(){this.rollbackHtml=document.querySelector(".gm-container").outerHTML}rollback(){document.querySelectorAll('[class*="gm"],[id*="gm"]').forEach((e=>e.remove())),this.promoteChildren(document.querySelector("#bodyContent")),this.menuItems=[],this.subMenuItems=[],this.childMenuItems=[],this.subMenuContainers=[],this.insertContent(this.body,0,this.rollbackHtml)}flatternMenu(){this.getIntialMenuItemsDom().forEach((e=>{const t=document.createElement("div");t.classList.add("gm-menu"),t.dataset.menuCol=e.menuCol,e.html.id&&(t.id=e.html.id),t.innerHTML=e.html.dataset.value,this.insertContent(this.body,0,t)})),this.getInitialSubMenuItemsDom().forEach((e=>{const t=document.createElement("div");t.classList.add("gm-sub-menu-item"),t.dataset.menuCol=e.menuCol,t.dataset.subMenuRow=e.subMenuRow,e.html.id&&(t.id=e.html.id),t.innerHTML=e.html.dataset.value,this.insertContent(this.body,0,t)})),this.getInitialChildMenuItems().forEach((e=>{const t=document.createElement("div");t.classList.add("gm-child-menu-item"),t.dataset.subMenuRow=e.subMenuRow,t.dataset.menuCol=e.menuCol,t.dataset.childMenuRow=e.childMenuRow,e.html.id&&(t.id=e.html.id),t.innerHTML=e.html.dataset.value,this.insertContent(this.body,0,t)}))}removeIntialMenuHtml=()=>document.querySelector(".gm-container").remove();moveBodyContent(){const e=document.createElement("div");e.id="bodyContent",[...this.body.children].forEach(((t,n)=>{"script"!==t.nodeName.toLowerCase()&&this.insertContent(e,n,t)})),this.insertContent(this.body,0,e)}moveMenuToContainer(){const e=document.createElement("div");e.id="gm-menu-container",e.style.gridTemplateColumns=`repeat(${this.menuItems.length}, min-content)`,this.menuItems.forEach((t=>{t.html.style.gridRow="1 / span 1",t.html.style.gridColumn=t.menuCol+" / span 1",this.insertContent(e,t.menuCol-1,t.html)})),this.insertContent(this.body,0,e)}addSubMenuBorders(){this.countSubMenuMenuItemsInGroup().forEach((e=>{this.getSubMenuItems({menuCol:e.menuCol,subMenuCol:e.rowCount})[0].html.style.borderBottom=this.menuBorder}))}countChildMenuItemsInGroup(){const e=[];return this.childMenuItems.forEach((t=>{const n=e.find((e=>e.menuCol===t.menuCol&&e.subMenuRow===t.subMenuRow))??!1;n?n.rowCount++:e.push({menuCol:t.menuCol,subMenuRow:t.subMenuRow,rowCount:1})})),e}countSubMenuMenuItemsInGroup(){const e=[];return this.subMenuItems.forEach((t=>{const n=e.find((e=>e.menuCol===t.menuCol))??!1;n?n.rowCount++:e.push({menuCol:t.menuCol,rowCount:1})})),e}addChildMenuBorders(){const e=this.countChildMenuItemsInGroup(),t=this.countSubMenuMenuItemsInGroup();e.forEach((e=>{const n=e.subMenuRow-1+e.rowCount,s=t.find((t=>t.menuCol===e.menuCol)).rowCount;if(n>s){let t=n-s;for(let n=0;n<t;n++){const t=this.getChildMenuItems({menuCol:e.menuCol,subMenuRow:e.subMenuRow,childRow:e.rowCount-n})[0];t.html.style.borderLeft=this.menuBorder,t.html.style.marginLeft="-1px"}}1!==e.subMenuRow&&(this.getChildMenuItems({menuCol:e.menuCol,subMenuRow:e.subMenuRow,childRow:1})[0].html.style.borderTop=this.menuBorder),this.getChildMenuItems({menuCol:e.menuCol,subMenuRow:e.subMenuRow,childRow:e.rowCount})[0].html.style.borderBottom=this.menuBorder}))}positionMenuItems(){this.menuItems.forEach((e=>{e.html.style.gridRow="1 / span 1",e.html.style.gridColumn=e.menuCol+" / span 1"}))}positionSubMenuItems(){this.subMenuItems.forEach((e=>{e.html.style.gridRow=e.subMenuRow+" / span 1",e.html.style.gridColumn="1 / span 1",e.html.style.display="grid",e.html.style.gridTemplateColumns="auto 10px";const t=document.createElement("div");t.innerHTML=e.html.innerHTML,e.html.innerHTML="",this.insertContent(e.html,0,t)}))}positionChildMenuItems(){this.childMenuItems.forEach((e=>{e.html.style.gridRow=e.subMenuRow+e.childMenuRow-1+" / span 1",e.html.style.gridColumn="2 / span 1",e.html.classList.add("gm-hidden")}))}onMenuClick(){this.menuItems.forEach((e=>{e.html.addEventListener("click",(()=>{if(e.html.classList.contains("gm-disabled"))return;const t=!e.showChildren;this.hideMenu(),t?t&&(this.showSubMenu(e.menuCol),e.showChildren=!0):e.showChildren=!1}))}))}onOffMenuClick(){document.querySelector("#bodyContent").addEventListener("click",(()=>this.hideMenu())),this.subMenuContainers.forEach((e=>{e.html.addEventListener("click",(e=>{const t=e.path.find((e=>"DIV"===e.nodeName&&(e.classList.contains("gm-sub-menu-item")||e.classList.contains("gm-child-menu-item"))))??!1;return t&&(t.classList.contains("gm-sub-menu-item")||this.getChildMenuItems({...t.dataset})[0].shown)?void 0:this.hideMenu()}))}))}onMenuItemsHover(){this.getMenuItemsAll().forEach((e=>{const t=e.html,n=()=>{t.classList.add("menu-item-hover")},s=()=>{t.classList.remove("menu-item-hover")};""!==t.id&&(this.onMouseOverCallback[t.id]=n,this.onMouseLeaveCallback[t.id]=s),t.addEventListener("mouseover",n),t.addEventListener("mouseleave",s)}))}disableMenuItem(e){const t=this.getMenuItemsAll().find((t=>t.html.id===e)).html;this.clickCallbacks.hasOwnProperty(e)&&(this.clickCallbacks[e].forEach((e=>{t.removeEventListener("click",e)})),this.clickCallbacks[e]=[]),this.onMouseOverCallback.hasOwnProperty(e)&&t.removeEventListener("mouseover",this.onMouseOverCallback[e]),this.onMouseLeaveCallback.hasOwnProperty(e)&&t.removeEventListener("mouseleave",this.onMouseLeaveCallback[e]),t.classList.remove("menu-item-hover"),t.classList.add("gm-disabled")}enableMenuItem(e){const t=this.getMenuItemsAll().find((t=>t.html.id===e)).html;t.classList.remove("gm-disabled"),t.addEventListener("mouseleave",this.onMouseLeaveCallback[e]),t.addEventListener("mouseover",this.onMouseOverCallback[e])}addMenuItemClickEvent(e,t){this.clickCallbacks.hasOwnProperty(e)||(this.clickCallbacks[e]=[]);const n=this.getMenuItemsAll().find((t=>t.html.id===e)).html,s=()=>{n.classList.contains("gm-disabled")||t()};this.clickCallbacks[e].push(s),n.addEventListener("click",s)}closeMenu(){document.querySelectorAll(".gm-sub-menu-container").forEach((e=>{e.classList.contains("gm-hidden")||e.classList.add("gm-hidden")})),this.menuItems.forEach((e=>e.showChildren=!1))}hideMenu(){this.hideSubMenus(),this.hideChildMenuItems(),this.menuItems.forEach((e=>e.showChildren=!1))}hideSubMenus(){this.subMenuContainers.forEach((e=>{e.html.style.zIndex=-1,e.html.classList.add("gm-hidden")}))}showSubMenu(e){const t=this.getSubMenuContainer(e);t.html.style.zIndex=12,t.html.classList.remove("gm-hidden")}isSunMenuOpen=e=>e.html.querySelector("span").classList.contains("down");subMenuItemHasChidlren=e=>this.getSubMenuItemChildren(e).length>0;hideChildMenuItems=()=>this.subMenuItems.forEach((e=>this.hideSubMenuItemChildren(e)));hideSubMenuItemChildren(e){if(!this.subMenuItemHasChidlren(e))return;const t=e.html.querySelector("span");t.classList.add("up"),t.classList.remove("down"),t.innerHTML=this.UP_ARROW,this.getSubMenuItemChildren(e).forEach((e=>e.html.classList.add("gm-hidden")))}hideOtherSubMenuItemChildren=e=>this.subMenuItems.forEach((t=>t.html!==e.html&&this.hideSubMenuItemChildren(t)));showSubMenuItemChildren(e){if(e.html.classList.contains("gm-disabled"))return;if(!this.subMenuItemHasChidlren(e))return;const t=e.html.querySelector("span");t.classList.add("down"),t.classList.remove("up"),t.innerHTML=this.DOWN_ARROW,t.id="gm-span",this.getSubMenuItemChildren(e).forEach((e=>{e.html.classList.remove("gm-hidden"),e.shown=!0}))}createSubmMenuExpanders=()=>this.subMenuItems.forEach((e=>this.subMenuItemHasChidlren(e)&&this.insertContent(e.html,1,`<span id="gm-span" class="up">${this.UP_ARROW}</span>`)));onSubMenuClick(){this.subMenuItems.forEach((e=>{this.subMenuItemHasChidlren(e)&&e.html.addEventListener("click",(()=>{this.hideOtherSubMenuItemChildren(e),this.isSunMenuOpen(e)?this.hideSubMenuItemChildren(e):this.showSubMenuItemChildren(e)}))}))}moveMenuChildrenToContainers(){for(let e=1;e<=this.menuItems.length;e++){const t=this.getMenuItem({menuCol:e}),n=this.getSubAndChildMenuItems(e),s=document.createElement("div");s.dataset.menuCol=e,s.className="gm-sub-menu-container gm-hidden",s.style.left=t.html.offsetLeft+"px",n.forEach((e=>s.appendChild(e.html))),this.insertContent(this.body,e-1,s)}}insertContent(e,t,n){if(this.isHtmlELement(n)||this.isString(n)){if(!this.isHtmlELement(n)&&this.isString(n)){const e=n;(n=document.createElement("div")).innerHTML=e,n=n.children[0]}0===e.children.length?e.append(n):0===t?e.children[0].insertAdjacentElement("beforeBegin",n):t>0&&t>e.children.length?e.lastChild.insertAdjacentElement("afterEnd",n):e.children[t-1].insertAdjacentElement("afterEnd",n)}}promoteChildren=e=>null!=e?e.replaceWith(...e.childNodes):"";isHtmlELement=e=>Object.prototype.toString.call(e).includes("[object HTML")&&Object.prototype.toString.call(e).includes("Element]")||e instanceof HTMLElement;isString=e=>"[object String]"===Object.prototype.toString.call(e);getCssProp=e=>getComputedStyle(this.body.parentElement).getPropertyValue("--"+e);getPixelCssProp=e=>this.pixelToNumber(this.getCssProp(e));pixelToNumber=e=>parseInt(e.trim().split("px")[0]);vh=e=>e*Math.max(document.documentElement.clientHeight,window.innerHeight||0)/100;vw=e=>e*Math.max(document.documentElement.clientWidth,window.innerWidth||0)/100};