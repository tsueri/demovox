<?php

namespace Demovox;

class DbMailDedup extends Db
{
	// DTO
	/** @var int */
	public $ID, $sign_ID;
	/** @var string */
	public $mail_md5;
	/** @var int */
	public $is_step2_done, $is_sheet_received, $state_remind_sheet_sent, $state_remind_signup_sent;
	/** @var string */
	public $creation_date;

	// Model
	protected $tableName = 'demovox_mails';

	/**
	 * @param DbSignatures $row signature row
	 *
	 * @return string|false 'insert' | 'update' | 'skip' | false for db errors
	 */
	public function importRow($row)
	{
		$inserted   = null;
		$updated    = false;
		$hashedMail = Strings::hashMail($row->mail);
		$mailRow    = $this->getRow(
			[
				'ID',
				'creation_date',
				'is_step2_done',
				'is_sheet_received',
				'state_remind_sheet_sent',
				'state_remind_signup_sent',
			],
			"mail_md5 = '" . $hashedMail . "'"
		);

		if (!$mailRow) {
			$setMailData = [
				'sign_ID'                  => $row->ID,
				'mail_md5'                 => $hashedMail,
				'creation_date'            => $row->creation_date,
				'is_step2_done'            => $row->is_step2_done ? 1 : 0,
				'is_sheet_received'        => $row->is_sheet_received ? 1 : 0,
				'state_remind_sheet_sent'  => $row->state_remind_sheet_sent,
				'state_remind_signup_sent' => $row->state_remind_signup_sent,
			];
			$save        = $this->insert($setMailData);
		} else {
			if (!$mailRow->is_step2_done) {
				return 'skip';
			}
			$setMailData                  = [];
			$setMailData['sign_ID']       = $row->ID;
			$setMailData['creation_date'] = $row->creation_date;
			if ($row->is_step2_done) {
				$setMailData['is_step2_done'] = 1;
			}
			if (!$mailRow->is_sheet_received && $row->is_sheet_received) {
				$setMailData['is_sheet_received'] = 1;
			}
			if ($mailRow->state_remind_sheet_sent !== 1 && $row->state_remind_sheet_sent == 1) {
				$setMailData['state_remind_sheet_sent'] = 1;
			}
			if ($mailRow->state_remind_signup_sent !== 1 && $row->state_remind_signup_sent == 1) {
				$setMailData['state_remind_signup_sent'] = 1;
			}
			$save    = $this->updateStatus($setMailData, ['ID' => $mailRow->ID]);
			$updated = true;
		}

		return $save ? ($updated ? 'update' : 'insert') : false;
	}
}