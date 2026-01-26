'use client';

import React from 'react';
import styles from './GeneratingLoader.module.css';

export function GeneratingLoader() {
    return (
        <div className={styles.wrapper}>
            <div className={styles.loaderWrapper}>
                <span className={styles.loaderLetter}>G</span>
                <span className={styles.loaderLetter}>e</span>
                <span className={styles.loaderLetter}>n</span>
                <span className={styles.loaderLetter}>e</span>
                <span className={styles.loaderLetter}>r</span>
                <span className={styles.loaderLetter}>a</span>
                <span className={styles.loaderLetter}>t</span>
                <span className={styles.loaderLetter}>i</span>
                <span className={styles.loaderLetter}>n</span>
                <span className={styles.loaderLetter}>g</span>
                <div className={styles.loader} />
            </div>
        </div>
    );
}
