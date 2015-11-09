/* =======================================================
	Copyright 2014 - ePortfolium - Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://opensource.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
   ======================================================= */

/// Check namespace existence
if( UIFactory === undefined )
{
  var UIFactory = {};
}

var g_URL2Unit_caches = {};

/// Define our type
//==================================
UIFactory["URL2Unit"] = function(node,condition)
//==================================
{
	if (condition!=null)
		clause = condition;
	this.id = $(node).attr('id');
	this.node = node;
	this.type = 'URL2Unit';
	this.uuid_node = $("uuid",$("asmResource[xsi_type='URL2Unit']",node));
	this.label_node = [];
	for (var i=0; i<languages.length;i++){
		this.label_node[i] = $("label[lang='"+languages[i]+"']",$("asmResource[xsi_type='URL2Unit']",node));
		if (this.label_node[i].length==0) {
			var newelement = createXmlElement("label");
			$(newelement).attr('lang', languages[i]);
			$("asmResource[xsi_type='URL2Unit']",node)[0].appendChild(newelement);
			this.label_node[i] = $("label[lang='"+languages[i]+"']",$("asmResource[xsi_type='URL2Unit']",node));
		}
	}
	this.local_label_node = [];
	for (var i=0; i<languages.length;i++){
		this.local_label_node[i] = $("local-label[lang='"+languages[i]+"']",$("asmResource[xsi_type='URL2Unit']",node));
		if (this.local_label_node[i].length==0) {
			var newelement = createXmlElement("local-label");
			$(newelement).attr('lang', languages[i]);
			$("asmResource[xsi_type='URL2Unit']",node)[0].appendChild(newelement);
			this.local_label_node[i] = $("local-label[lang='"+languages[i]+"']",$("asmResource[xsi_type='URL2Unit']",node));
		}
	}
	this.query = ($("metadata-wad",node).attr('query')==undefined)?'':$("metadata-wad",node).attr('query');
	this.encrypted = ($("metadata",node).attr('encrypted')=='Y') ? true : false;
	this.multilingual = ($("metadata",node).attr('multilingual-resource')=='Y') ? true : false;
	this.display = {};
};

//==================================
UIFactory["URL"].prototype.getAttributes = function(type,langcode)
//==================================
{
	var result = {};
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	if (this.multilingual!=undefined && !this.multilingual)
		langcode = 0;
	//---------------------
	if (dest!=null) {
		this.display[dest]=langcode;
	}
	//---------------------
	if (type==null)
		type = 'default';
	//---------------------
	if (type=='default') {
		result['restype'] = this.type;
		result['uuid'] = this.uuid_node[langcode].text();
		result['label'] = this.label_node[langcode].text();
		result['local_label'] = this.local_label_node[langcode].text();
	}
	return result;
}

/// Display
//==================================
UIFactory["URL2Unit"].prototype.getView = function(dest,type,langcode)
//==================================
{
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	//---------------------
	this.multilingual = ($("metadata",this.node).attr('multilingual-resource')=='Y') ? true : false;
	if (!this.multilingual)
		langcode = NONMULTILANGCODE;
	//---------------------
	if (dest!=null) {
		this.display[dest] = langcode;
	}
	var label = this.label_node[langcode].text();
	var local_label = this.local_label_node[langcode].text();
	if (local_label!="")
		label = local_label;
	if (this.encrypted)
		label = decrypt(label.substring(3),g_rc4key);
	if (label=='')
		label = "---";
	var html ="";
	if (this.query.indexOf('self.')>-1)
		html = "<a href='#' class='URL2Unit-link' onclick=\"javascript:$('#sidebar_"+this.uuid_node.text()+"').click()\">"+label+"</a>";
//		html = "<a href='#' class='URL2Unit-link' onclick=\"javascript:displayPage('"+this.uuid_node.text()+"',100,'standard','0',true)\">"+label+"</a>";
	else
		html = "<a href='page.htm?id="+this.uuid_node.text()+"&type=standard&lang="+LANG+"' class='URL2Unit-link' target='_blank'>"+label+"</a>";
	return html;
};


/// Editor
//==================================
UIFactory["URL2Unit"].update = function(selected_item,itself,langcode,type)
//==================================
{
	var value = $(selected_item).attr('value');
	//---------------------
	if (itself.encrypted)
		value = "rc4"+encrypt(value,g_rc4key);
	//---------------------
	$(itself.uuid_node).text(value);
	for (var i=0; i<languages.length;i++){
		var label = $(selected_item).attr('label_'+languages[i]);
		//---------------------
		if (itself.encrypted)
			label = "rc4"+encrypt(label,g_rc4key);
		//---------------------
		$(itself.label_node[i]).text(label);
	}
	itself.save();
};

//==================================
UIFactory["URL2Unit"].prototype.displayEditor = function(destid,type,langcode,disabled,cachable)
//==================================
{
	if (cachable==undefined || cachable==null)
		cachable = false;
	var queryattr_value = $("metadata-wad",this.node).attr('query');
	if (queryattr_value!=undefined && queryattr_value!='') {
		var p1 = queryattr_value.indexOf('.');
		var p2 = queryattr_value.indexOf('.',p1+1);
		var code = queryattr_value.substring(0,p1);
		if (code=='self')
			code = $("code",$("asmRoot>asmResource[xsi_type='nodeRes']",UICom.root.node)).text();
		var semtag = queryattr_value.substring(p1+1,p2);
		var srce = queryattr_value.substring(p2+1);
		var self = this;
		if (cachable && g_URL2Unit_caches[queryattr_value]!=undefined && g_URL2Unit_caches[queryattr_value]!="")
			UIFactory["URL2Unit"].parse(destid,type,langcode,g_URL2Unit_caches[queryattr_value],self,disabled,srce);
		else
			$.ajax({
				type : "GET",
				dataType : "xml",
				url : "../../../"+serverBCK+"/nodes?portfoliocode=" + code + "&semtag="+semtag,
				success : function(data) {
					if (cachable)
						g_URL2Unit_caches[queryattr_value] = data;
					UIFactory["URL2Unit"].parse(destid,type,langcode,data,self,disabled,srce);
				}
			});
	}
};


//==================================
UIFactory["URL2Unit"].parse = function(destid,type,langcode,data,self,disabled,srce) {
//==================================
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	if (!self.multilingual)
		langcode = NONMULTILANGCODE;
	if (disabled==null)
		disabled = false;
	//---------------------
	var self_uuid = $(self.uuid_node).text();
	if (self.encrypted)
		self_uuid = decrypt(self_uuid.substring(3),g_rc4key);
	//---------------------
	var local_label = self.local_label_node[langcode].text();
	if (self.encrypted)
		local_label = decrypt(local_label.substring(3),g_rc4key);
	var input_local_label = $("<input type='text' class='form-control' name='local-label' value=\""+local_label+"\">");
	$(input_local_label).change(function (ev){
		UIFactory["URL2Unit"].update(input_local_label,self,langcode);
	});
	$("#"+destid).append($(btn_group));
	//---------------------
	if (type==undefined || type==null)
		type = 'select';
	//------------------------------------------------------------
	if (type=='select') {
		var html = "<div class='btn-group'>";
		html += "<button type='button' class='btn btn-default select select-label' id='button_"+self.id+"'>&nbsp;</button>";
		html += "<button type='button' class='btn btn-default dropdown-toggle select' data-toggle='dropdown' aria-expanded='false'><span class='caret'></span><span class='sr-only'>Toggle Dropdown</span></button>";
		html += "</div>";
		var btn_group = $(html);
		$("#"+destid).append($(btn_group));
		html = "<ul class='dropdown-menu' role='menu'></ul>";
		var select  = $(html);
		//----------------- null value to erase
		html = "<li></li>";
		var select_item = $(html);
		html = "<a href='#' value='' code='' ";
		for (var j=0; j<languages.length;j++) {
			html += "label_"+languages[j]+"='&nbsp;' ";
		}
		html += ">";
		html += "&nbsp;</a>";
		var select_item_a = $(html);
		$(select_item_a).click(function (ev){
			$("#button_"+self.id).html($(this).attr("label_"+languages[langcode]));
			UIFactory["URL2Unit"].update(this,self,langcode);
		});
		$(select_item).append($(select_item_a))
		$(select).append($(select_item));
		//--------------------
		var nodes = $("node",data);
		for ( var i = 0; i < $(nodes).length; i++) {
			var resource = null;
			if ($("asmResource",nodes[i]).length==3)
				resource = $("asmResource[xsi_type!='nodeRes'][xsi_type!='context']",nodes[i]); 
			else
				resource = $("asmResource[xsi_type='nodeRes']",nodes[i]);
			var code = $('code',resource).text();
			var display_code = true;
			if (code.indexOf("@")>-1) {
				display_code = false;
				code =code.substring(0,code.indexOf("@"))+code.substring(code.indexOf("@")+1);
			}
			if (code.indexOf('-#')>-1) {
				html = "<li class='divider'></li><li></li>";
			} else {
				html = "<li></li>";
			}
			var select_item = $(html);
			if (code.indexOf('-#')>-1) {
				html = "<a href='#'>" + $(srce+"[lang='"+languages[langcode]+"']",resource).text() + "</a>";
				$(select_item).html(html);
			} else {
				html = "<a href='#' value='"+$(nodes[i]).attr('id')+"' code='"+code+"' class='sel"+code+"' ";
				for (var j=0; j<languages.length;j++){
					html += "label_"+languages[j]+"=\""+$(srce+"[lang='"+languages[j]+"']",resource).text()+"\" ";
				}
				html += ">";
				
				if (display_code)
					html += code + " ";
				html += $(srce+"[lang='"+languages[langcode]+"']",resource).text()+"</a>";
				var select_item_a = $(html);
				$(select_item_a).click(function (ev){
					$("#button_"+self.id).html($(this).attr("label_"+languages[langcode]));
					$("#button_"+self.id).attr('class', 'btn btn-default select select-label').addClass("sel"+$(this).attr("code"));
					UIFactory["URL2Unit"].update(this,self,langcode);
				});
				$(select_item).append($(select_item_a))
				//-------------- update button -----
				if (self_uuid!="" && self_uuid==$(nodes[i]).attr('id')) {
					$("#button_"+self.id).html($(srce+"[lang='"+languages[langcode]+"']",resource).text());
					$("#button_"+self.id).attr('class', 'btn btn-default select select-label').addClass("sel"+$(this).attr("code"));
				}
			}
			$(select).append($(select_item));
		}
		$(btn_group).append($(select));
	}

};

//==================================
UIFactory["URL2Unit"].prototype.save = function()
//==================================
{
	UICom.UpdateResource(this.id,writeSaved);
	this.refresh();
};

//==================================
UIFactory["URL2Unit"].prototype.refresh = function()
//==================================
{
	for (dest in this.display) {
		$("#"+dest).html(this.getView(null,null,this.display[dest]));
	};

};
