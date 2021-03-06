<?php

/**
 * Copyright 2012 Martijn van de Rijdt
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//This controller for AJAX POSTS simply directs to a model and returns a response

class Data extends CI_Controller {

	function __construct() {
			parent::__construct();
			$this->load->model('Survey_model', '', TRUE);
			$this->load->model('Instance_model', '', TRUE);
			$this->load->helper(array('subdomain','url', 'string', 'http'));
		
	}

	public function index()
	{
		show_404();
	}
	
//	public function upload()
//	{
//		$subdomain = get_subdomain(); //from subdomain helper
//		$data_received = $this->input->post(); //returns FALSE if there is no POST data
//		
//		if ($data_received && $this->Survey_model->is_live_survey($subdomain))
//		//NOTE: the second condition prevents submission of data of existing but 'no-longer-live' surveys!
//		{
//			$response = $this->Survey_model->add_survey_data($data_received, $subdomain);			
//		}
//		else
//		{
//			$response = array('error'=>'no data received or survey not live');
//		}
//		
//		echo json_encode($response);
//	}
//	// could be used to allow sending of server data to client (for editing e.g.)
//	public function download()
//	{
//	}

	public function submission()
	{
		$time_start = time();
		$message = '';
		$http_code = 0;
		$subdomain = get_subdomain();
		$submission_url = $this->Survey_model->get_form_submission_url();

		extract($_POST);

		if (!$submission_url){
			return $this->output->set_status_header(500, 'OpenRosa server submission url not set');
		}

		if(!isset($xml_submission_data) || $xml_submission_data == '')
		{
			return $this->output->set_status_header(500, 'Enketo server did not receive data');
		}

		$xml_submission_filepath = "/tmp/".random_string('alpha', 10).".xml";//*/"/tmp/data_submission.xml";
		$xml_submission_file = fopen($xml_submission_filepath, 'w');
			
		if (!$xml_submission_file)
		{
			return $this->output->set_status_header(500, "Issue creating file from uploaded XML data (Enketo server)");
		}

		fwrite($xml_submission_file, $xml_submission_data);
		fclose($xml_submission_file);
		
		$fields = array('xml_submission_file'=>'@'.$xml_submission_filepath.';type=text/xml');  

		if (!empty($_FILES))
		{
			//print_r($_FILES);
			foreach($_FILES as $nodeName => $file)
			{
				$new_location =  '/tmp/'.$file['name'];
				$valid = move_uploaded_file($file['tmp_name'], $new_location);
				if ($valid)
				{
					$fields[$nodeName] = '@'.$new_location.';type='.$file['type'];
					log_message('debug', 'added file '.$new_location.' to submission');
				}
				//TODO: issue with file size > 30 mb (see .htaccess): this fails silently
				//need to return feedback to user and/or check for this in client before sending?
				//TODO: USER FEEDBACK IF NOT VALID?
				//echo $fields[$nodeName];
			}
		}

		$ch = curl_init();
		curl_setopt($ch,CURLOPT_URL,$submission_url);
		curl_setopt($ch,CURLOPT_HTTPHEADER, array
			(
			'X-OpenRosa-Version: 1.0',
			'Date: '.$Date
			)
		);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);

		$result = curl_exec($ch);

		$info = curl_getinfo($ch);

		if ($result)
		{
			$response = '';
			//foreach ($info as $property => $value) 
			//{ 
			//	$response .= $property . " : " . $value . "<br />"; 
			//}
			$http_code = $info['http_code'];
			log_message('debug', 'data submission took '.(time()-$time_start).' seconds.');
			$this->output->set_status_header($http_code, $result);
		}
		else {
			print_r($info);
			echo 'curl_error:'.curl_error($ch).' number: '+curl_errno($ch);
		}
		curl_close($ch);
	}

	//performs HEAD request to get X-OpenRosa-Accept-Content-Length header
	public function max_size()
	{
		$submission_url = $this->Survey_model->get_form_submission_url();
		$curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $submission_url);
        curl_setopt($curl, CURLOPT_NOBODY, true);
        curl_setopt($curl, CURLOPT_HEADER, true);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $header = curl_exec($curl);
        curl_close($curl);
        $header_arr = http_parse_headers($header);   
        echo $header_arr['X-Openrosa-Accept-Content-Length'];
	}

	public function edit_url()
	{
		log_message('debug', 'edit url function started');
		$subdomain = get_subdomain();

		if (isset($subdomain))
		{
			show_404();
		}
		else 
		{
			extract($_POST);

			//trim strings first??
			if (!empty($server_url) && !empty($form_id))
			{
				//to be replaced by user-submitted and -editable submission_url
				$submission_url = (strrpos($server_url, '/') === strlen($server_url)-1) ? 
					$server_url.'submission' :$server_url.'/submission';

				$data_url = (empty($data_url)) ? NULL : $data_url;
				$email = (empty($email)) ? NULL : $email;

				$result = $this->Survey_model->launch_survey($server_url, $form_id, $submission_url, $data_url, $email);

		        if(isset($instance) && isset($instance_id) && isset($result['subdomain']))
		        {
		            $rs = $this->Instance_model->insert_instance($result['subdomain'], $instance_id,
		                $instance, $return_url);
		            if($rs !== null)
		            {
		                $result['edit_url'] = $result['edit_url'] . '?instance_id=' . $instance_id;
		            }
		            else
		            {
		              unset($result['edit_url']);
		              $result['reason'] = "someone is already editing instance";
		            }
		        }

				echo json_encode($result);
			}	
			else
			{
				echo json_encode(array('success'=>FALSE, 'reason'=>'empty'));
			}

		}
	}
}
?>

