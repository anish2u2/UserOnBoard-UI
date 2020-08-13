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
		return "home";
	}
	
	@RequestMapping(path="/register")
	public String register() {
		return "home";
	}
	
	@RequestMapping(path="/home")
	public String home() {
		return "home";
	}
	
	
}
