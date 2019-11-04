var fontSize, textColor = [0, 0, 0], fontFamily = 'Helvetica';
(function ($) {
	'use strict';

	var $input;
	$(function () {
		var demovoxMediaUploader;
		$('.uploadButton').click(function (e) {
			e.preventDefault();
			$input = $('#' + $(this).data('inputId'));
			// If the uploader object has already been created, reopen the dialog.
			if (demovoxMediaUploader) {
				demovoxMediaUploader.open();
				return;
			}
			// Extend the wp.media object.
			demovoxMediaUploader = wp.media.frames.file_frame = wp.media({
				// Set the values through wp_localize_script so that they can be localised/translated.
				title: demovoxAdmin.uploader.title,
				button: {
					text: demovoxAdmin.uploader.text
				}, multiple: false
			});
			// When a file is selected, grab the URL and set it as the fields value.
			demovoxMediaUploader.on('select', function () {
				var attachment = demovoxMediaUploader.state().get('selection').first().toJSON();
				$input.val(attachment.url);
			});
			// Open the uploader dialog.
			demovoxMediaUploader.open();
		});

		fontSize = parseInt($('#demovox_fontsize').val());
		$('.showPdf').click(function () {
			var $container = $(this).closest('div'),
				lang = $(this).data('lang'),
				qrMode = $('#demovox_field_qr_mode').val(),
				pdfUrl = $('#demovox_signature_sheet_' + lang).val(),
				fields = [
					createField('BE', 'canton', lang),
					createField('Bern', 'commune', lang),
					createField('3001', 'zip', lang),
					createField('21', 'birthdate_day', lang),
					createField('10', 'birthdate_month', lang),
					createField('88', 'birthdate_year', lang),
					createField('Theaterplatz 4', 'street', lang),
				],
				qrData = qrMode === 'disabled'
					? null
					: {
						"text": "JNXWE",
						"x": getField('qr_img_' + lang + '_x'),
						"y": getField('qr_img_' + lang + '_y'),
						"rotate": getField('qr_img_' + lang + '_rot'),
						"size": getField('qr_img_size_' + lang),
						"textX": getField('qr_text_' + lang + '_x'),
						"textY": getField('qr_text_' + lang + '_y'),
						"textRotate": getField('qr_text_' + lang + '_rot'),
						"textSize": fontSize,
						"textColor": textColor
					};
			createPdf('preview', pdfUrl, fields, qrData, $container);
		});
		$('.ajaxButton').click(function () {
			var cont = $(this).data('container'),
				ajaxUrl = $(this).data('ajax-url'),
				confirmTxt = $(this).data('confirm'),
				$ajaxContainer = $(this).parent().find(cont ? cont : '.ajaxContainer');
			if (typeof confirmTxt !== 'undefined' && !confirm(confirmTxt)) {
				return;
			}
			$ajaxContainer.css('cursor','progress');
			$ajaxContainer.html('Loading...');
			$.get(ajaxUrl)
				.done(function (data) {
					$ajaxContainer.html(data);
				})
				.fail(function () {
					$ajaxContainer.html('Error');
				})
				.always(function () {
					$ajaxContainer.css('cursor','auto');
				});
		});
	});
})(jQuery);

function getField(name) {
	return parseInt($('#demovox_field_' + name).val())
}

function createField(value, name, lang) {
	var x = getField(name + '_' + lang + '_x'),
		y = getField(name + '_' + lang + '_y'),
		rotate = getField(name + '_' + lang + '_rot');
	return {
		"drawText": value,
		"x": x,
		"y": y,
		"rotate": rotate,
		"size": fontSize,
		"font": fontFamily,
		"color": textColor
	};
}
function setOnVal($check, $set, checkValue, setValue) {
	if ($check.is("input")) {
		$check.keyup(function () {
			if($(this).val() === checkValue){
				$set.val(setValue).change();
			}
		});
	}
	$check.change(function () {
		if($(this).val() === checkValue){
			$set.val(setValue).change();
		}
	});
	if($check.val() === checkValue){
		$set.val(setValue).change();
	}
}

function showOnVal($check, $showHide, value, invert) {
	var invert = (invert !== undefined) ? invert : false;
	if ($check.is("input")) {
		$check.keyup(function () {
			showHideEl($showHide, isIn($(this).val(), value));
		});
	}
	$check.change(function () {
		showHideEl($showHide, isIn($(this).val(), value));
	});
	showHideEl($showHide, $check.val() === value);
}

function hideOnVal($check, $showHide, value) {
	showOnVal($check, $showHide, value, true)
}

function showOnChecked($check, $showHide, invert) {
	var invert = (invert !== undefined) ? invert : false;
	$check.change(function () {
		showHideEl($showHide, $(this).is(':checked'));
	});
	showHideEl($showHide, $check.is(':checked'));
}

function hideOnChecked($check, $showHide) {
	showOnVal($check, $showHide, true);
}

function isIn(needle, haystack) {
	if (Array.isArray(haystack)) {
		return haystack.indexOf(needle) !== -1;
	} else {
		return needle === haystack;
	}
}

function showHideEl($els, show, invert) {
	var invert = (invert !== undefined) ? invert : false;
	if ((show && !invert) || (!show && invert)) {
		var $el;
		$els.each(function () {
			$el = $(this);
			if (!$el.hasClass('hidden')) {
				$el.show();
			}
		});
	} else {
		$els.hide();
	}
}

function nDate(year, month, day) {
	var monthIndex = month - 1;
	return new Date(year, monthIndex, day);
}