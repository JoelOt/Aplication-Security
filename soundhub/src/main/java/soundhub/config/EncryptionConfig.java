package soundhub.config;

import org.jasypt.encryption.StringEncryptor;
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class EncryptionConfig {

    @Value("${encryption.key}")
    private String encryptionKey;

    @Value("${encryption.algorithm:PBEWithMD5AndDES}")
    private String algorithm;

    @Value("${encryption.iterations:1000}")
    private String iterations;

    @Value("${encryption.pool-size:1}")
    private String poolSize;

    @Value("${encryption.salt-generator:org.jasypt.salt.ZeroSaltGenerator}")
    private String saltGenerator;

    @Value("${encryption.output-type:base64}")
    private String outputType;

    @Primary
    @Bean("jasyptStringEncryptor")
    public StringEncryptor jasyptStringEncryptor() {
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();

        config.setPassword(encryptionKey);
        config.setAlgorithm(algorithm);
        config.setKeyObtentionIterations(iterations);
        config.setPoolSize(poolSize);
        config.setSaltGeneratorClassName(saltGenerator);
        config.setStringOutputType(outputType);

        encryptor.setConfig(config);

        return encryptor;
    }
}