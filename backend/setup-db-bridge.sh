#!/usr/bin/bash

ssh -N -L 3306:localhost:3306 dev.charrier.ovh -p 2234
