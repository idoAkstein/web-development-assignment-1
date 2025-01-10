/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostWithoutId'
 *     responses:
 *       200:
 *         description: The new post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request error - body param is missing or invalid
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update post by id
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Id of the post to update
 *         example: 674069829f3ed9c93edb75b0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostWithoutId'
 *     responses:
 *       200:
 *         description: Update succeeded
 *       400:
 *         description: Invalid post id or body
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Find post by id
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Id of the post to find
 *         example: 674069829f3ed9c93edb75b0
 *     responses:
 *       200:
 *         description: The post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid post id
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Find all posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sender
 *         schema:
 *           type: string
 *         description: Id of the user to find their posts
 *         example: 674069829f3ed9c93edb75b0
 *     responses:
 *       200:
 *         description: The posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid sender
 *       500:
 *         description: Internal server error
 */
