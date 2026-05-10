package com.example.m1dwa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@EnableScheduling
public class M1DwaApplication {

    private static final Logger logger = LoggerFactory.getLogger(M1DwaApplication.class);

    public static void main(String[] args) {
        logger.info("Starting M1DWA Server Application...");
        SpringApplication.run(M1DwaApplication.class, args);
        logger.info("M1DWA Server Application Started Successfully!");
    }
}
