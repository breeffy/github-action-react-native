import * as core from '@actions/core';
import * as installer from '../installer';
import * as auth from '../auth';
import * as gpg from '../gpg';
import * as path from 'path';
import {INPUTES, STATES, DEFAULTS} from '../constants';

export const setupJava = async () => {
  try {
    let version = core.getInput(INPUTES.VERSION);
    if (!version) {
      version = core.getInput(INPUTES.JAVA_VERSION, {required: true});
    }
    const arch = core.getInput(INPUTES.ARCHITECTURE, {required: true});
    const javaPackage = core.getInput(INPUTES.JAVA_PACKAGE, {
      required: true
    });
    const jdkFile = core.getInput(INPUTES.JDK_FILE, {required: false});

    await installer.getJava(version, arch, jdkFile, javaPackage);

    const matchersPath = path.join(__dirname, '..', '..', '.github');
    core.info(`##[add-matcher]${path.join(matchersPath, 'java.json')}`);

    const id = core.getInput(INPUTES.SERVER_ID, {required: false});
    const username = core.getInput(INPUTES.SERVER_USERNAME, {
      required: false
    });
    const password = core.getInput(INPUTES.SERVER_PASSWORD, {
      required: false
    });
    const gpgPrivateKey =
      core.getInput(INPUTES.GPG_PRIVATE_KEY, {required: false}) || undefined;
    const gpgPassphrase =
      core.getInput(INPUTES.GPG_PASSPHRASE, {required: false}) ||
      (gpgPrivateKey ? DEFAULTS.GPG_PASSPHRASE : undefined);

    if (gpgPrivateKey) {
      core.setSecret(gpgPrivateKey);
    }

    await auth.configAuthentication(id, username, password, gpgPassphrase);

    if (gpgPrivateKey) {
      core.info('importing private key');
      const keyFingerprint = (await gpg.importKey(gpgPrivateKey)) || '';
      core.saveState(STATES.GPG_PRIVATE_KEY_FINGERPRINT, keyFingerprint);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};
