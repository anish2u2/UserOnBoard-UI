package com.onboard.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author Anish Singh(anish2u2@gmail.com)
 *
 * 10-Aug-2020
 */

@Controller
public class LoginController {
	
	@RequestMapping(path="/login")
	public String login() {
		return "index";
	}
	
	@RequestMapping(path="/register")
	public String register() {
		return "register";
	}
	
	@RequestMapping(path="/home")
	public String home() {
		return "home";
	}
	
	
}
