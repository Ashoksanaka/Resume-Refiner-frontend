import styles from './layout.module.css';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.authLayout}>
            <div className={styles.authContainer}>
                <div className={styles.logo}>
                    <span className={styles.logoText}>Resume AI</span>
                </div>
                {children}
            </div>
        </div>
    );
}
