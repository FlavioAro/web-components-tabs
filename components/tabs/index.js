(function() {
    'use strict';
     
    if (!(window.customElements && document.body.attachShadow)) {
      document.querySelector('ds-tabs').innerHTML = "<b>Your browser doesn't support Shadow DOM and Custom Elements v1.</b>";
      return;
    }
    
    let selected_ = null;
      
    customElements.define('ds-tabs', class extends HTMLElement {
    
      constructor() {
        super();
    
        let shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `
          <style>
            :host {
              display: inline-block;
              width: 650px;
              font-family: 'Roboto Slab';
              contain: content;
            }
            :host([background]) {
              background: var(--background-color, #9E9E9E);
              border-radius: 10px;
              padding: 10px;
            }
            #panels {
              box-shadow: 0 2px 2px rgba(0, 0, 0, .3);
              background: white;
              border-radius: 3px;
              padding: 16px;
              height: 250px;
              overflow: auto;
            }
            #tabs {
              display: inline-flex;
              -webkit-user-select: none;
              user-select: none;
            }
            #tabs slot {
              display: inline-flex;
            }
            #tabs ::slotted(*) {
              font: 400 16px/22px 'Roboto';
              padding: 16px 8px;
              margin: 0;
              text-align: center;
              width: 100px;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
              cursor: pointer;
              border-top-left-radius: 3px;
              border-top-right-radius: 3px;
              background: linear-gradient(#fafafa, #eee);
              border: none;
            }
            #tabs ::slotted([aria-selected="true"]) {
              font-weight: 600;
              background: white;
              box-shadow: none;
            }
            #tabs ::slotted(:focus) {
              z-index: 1;
            }
            #panels ::slotted([aria-hidden="true"]) {
              display: none;
            }
          </style>
          <div id="tabs">
            <slot id="tabsSlot" name="title"></slot>
          </div>
          <div id="panels">
            <slot id="panelsSlot"></slot>
          </div>
        `;
      }
      
      get selected() {
        return selected_;
      }
    
      set selected(idx) {
        selected_ = idx;
        this._selectTab(idx);
    
        this.setAttribute('selected', idx);
      }
      
      connectedCallback() {
        this.setAttribute('role', 'tablist');
    
        const tabsSlot = this.shadowRoot.querySelector('#tabsSlot');
        const panelsSlot = this.shadowRoot.querySelector('#panelsSlot');
    
        this.tabs = tabsSlot.assignedNodes({flatten: true});
        this.panels = panelsSlot.assignedNodes({flatten: true}).filter(el => {
          return el.nodeType === Node.ELEMENT_NODE;
        });
        
        for (let [i, panel] of this.panels.entries()) {
          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('tabindex', 0);
        }
        
        this._boundOnTitleClick = this._onTitleClick.bind(this);
        this._boundOnKeyDown = this._onKeyDown.bind(this);
    
        tabsSlot.addEventListener('click', this._boundOnTitleClick);
        tabsSlot.addEventListener('keydown', this._boundOnKeyDown);
        
        this.selected = this._findFirstSelectedTab() || 0;
      }
      
      disconnectedCallback() {
        const tabsSlot = this.shadowRoot.querySelector('#tabsSlot');
        tabsSlot.removeEventListener('click', this._boundOnTitleClick);
        tabsSlot.removeEventListener('keydown', this._boundOnKeyDown);
      }
      
      _onTitleClick(e) { 
        if (e.target.slot === 'title') {
          this.selected = this.tabs.indexOf(e.target);
          e.target.focus();
        }
      }
      
      _onKeyDown(e) {
        switch (e.code) {
          case 'ArrowUp':
          case 'ArrowLeft':
            e.preventDefault();
            var idx = this.selected - 1;
            idx = idx < 0 ? this.tabs.length - 1 : idx;
            this.tabs[idx].click();
            break;
          case 'ArrowDown':
          case 'ArrowRight':
            e.preventDefault();
            var idx = this.selected + 1;
            this.tabs[idx % this.tabs.length].click();
            break;
          default:
            break;
        }
      }
    
      _findFirstSelectedTab() {
        let selectedIdx;
        for (let [i, tab] of this.tabs.entries()) {
          tab.setAttribute('role', 'tab');
    
          if (tab.hasAttribute('selected')) {
            selectedIdx = i;
          }
        }
        return selectedIdx;
      }
      
      _selectTab(idx = null) {
        for (let i = 0, tab; tab = this.tabs[i]; ++i) {
          let select = i === idx;
          tab.setAttribute('tabindex', select ? 0 : -1);
          tab.setAttribute('aria-selected', select);
          this.panels[i].setAttribute('aria-hidden', !select);
        }
      }
      
    });
       
    })();