async function createUser(data) {
    const { userPass, userLogin, userMail, userSafetyPass } = data

    const email = userMail.toLowerCase()
    let encryptedMail
    let hash
    let safePassHash
    let emailIv
    try {
        emailIv = await utils.createSafeToken(16)
        encryptedMail = await utils.encrypt(email, emailIv)
        hash = await argon2.hash(userPass, {
            type: argon2[config.argon2.type],
            hashLength: config.argon2.hashLength,
            parallelism: config.argon2.parallelism,
        })
        safePassHash = await argon2.hash(userSafetyPass, {
            type: argon2[config.argon2.type],
            hashLength: config.argon2.hashLength,
            parallelism: config.argon2.parallelism,
        })
    } catch (error) {
        logger.error(error)
        throw new Error('Something went wrong')
    }

    const user = new User({
        email: encryptedMail,
        emailIv,
        login: userLogin,
        password: hash,
        safetyPass: safePassHash,
    })

    try {
        const saveResult = await user.save()
        if (saveResult) {
            return `user ${userMail} Successfully created`
        }
    } catch (saveError) {
        if (saveError.code === 11000) {
            let field = saveError.errmsg.split('index: ')[1]
            field = field.split(' dup key')[0]
            field = field.substring(0, field.lastIndexOf('_'))
            let errMsg
            if (field === 'email') {
                errMsg = 'email taken'
            }
            if (field === 'login') {
                errMsg = 'login taken'
            }
            throw errMsg
        }

        throw saveError
    }
}