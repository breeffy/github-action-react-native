import * as core from '@actions/core';
import * as gpg from '../gpg';
import {INPUTES, STATES} from '../constants';

export const cleanupJava = async () => {
  if (core.getInput(INPUTES.GPG_PRIVATE_KEY, {required: false})) {
    core.info('removing private key from keychain');
    try {
      const keyFingerprint = core.getState(STATES.GPG_PRIVATE_KEY_FINGERPRINT);
      await gpg.deleteKey(keyFingerprint);
    } catch (error) {
      core.setFailed('failed to remove private key');
    }
  }
};
