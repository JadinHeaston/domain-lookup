<?PHP

class DatabaseConnector
{
	protected $connection;
	protected $type;

	private $queries = array(
		'listTables' => array(
			'mysql' => 'SHOW FULL tables',
			'sqlite' => 'SELECT * FROM sqlite_schema WHERE type =\'table\' AND name NOT LIKE \'sqlite_%\'',
			'sqlsrv' => 'SELECT DISTINCT TABLE_NAME FROM information_schema.tables'
		),
		'getTableInformation' => array(
			'mysql' => 'DESCRIBE ?',
			'sqlite' => 'PRAGMA table_info(?)',
			'sqlsrv' => 'SELECT * FROM information_schema.columns WHERE TABLE_NAME = ? order by ORDINAL_POSITION'
		),
		'getTableIndexes' => array(
			'mysql' => 'SHOW INDEX FROM ?',
			'sqlite' => 'SELECT * FROM sqlite_master WHERE type = \'index\' AND tbl_name = ?',
			'sqlsrv' => 'SELECT * FROM sys.indexes WHERE object_id = (SELECT object_id FROM sys.objects WHERE name = ?)'
		),
		'getTableCreation' => array(
			'mysql' => 'SHOW CREATE TABLE ?',
			'sqlite' => 'SELECT sql FROM sqlite_schema WHERE name = ?',
			'sqlsrv' => false //Not available without a stored procedure.
		),
		'createTable' => array(
			'mysql' => 'CREATE TABLE IF NOT EXISTS ? ()',
			'sqlite' => 'CREATE TABLE IF NOT EXISTS ? (column_name datatype, column_name datatype);',
			'sqlsrv' => ''
		)
	);

	public function __construct(string $type, string $hostPath, int $port = null, string $db = '', string $user = '', string $pass = '', string $charset = 'utf8mb4', bool|null $trustCertificate = null)
	{
		$this->type = strtolower(trim($type));
		try
		{
			//Creating DSN string.
			$dsn = $this->type;
			if ($this->type === 'mysql')
				$dsn .= ':host=';
			elseif ($this->type === 'sqlite')
				$dsn .= ':';
			elseif ($this->type === 'sqlsrv')
				$dsn .= ':Server=';

			$dsn .= $hostPath;

			if ($this->type === 'mysql')
				$dsn .= ';port=' . strval($port);

			if ($this->type === 'mysql')
				$dsn .= ';dbname=';
			elseif ($this->type === 'sqlsrv')
				$dsn .= ';Database=';

			$dsn .= $db;

			if ($this->type === 'mysql')
				$dsn .= ';charset=' . $charset;
			if ($this->type === 'sqlsrv' && $trustCertificate !== null)
				$dsn .= ';TrustServerCertificate=' . strval(intval($trustCertificate));

			//Attempting connection.
			$this->connection = new \PDO($dsn, $user, $pass);
			$this->connection->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_WARNING);
			$this->connection->setAttribute(\PDO::ATTR_EMULATE_PREPARES, false);
			$this->connection->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
		}
		catch (\PDOException $e)
		{
			exit($e->getMessage());
		}

		return $this->connection;
	}

	public function executeStatement($query = '', $params = [], $skipPrepare = false)
	{
		try
		{
			if ($skipPrepare !== true)
			{
				$stmt = $this->connection->prepare($query);

				if ($stmt === false)
					throw new \Exception('Unable to do prepared statement: ' . $query);

				$stmt->execute($params);
				return $stmt;
			}
			else
				return $this->connection->exec($query);
		}
		catch (\Exception $e)
		{
			throw new \Exception($e->getMessage());
		}
	}

	public function select($query = '', $params = [])
	{
		try
		{
			$stmt = $this->executeStatement($query, $params);
			return $stmt->fetchAll();
		}
		catch (\Exception $e)
		{
			throw new \Exception($e->getMessage());
		}
		return false;
	}

	public function update($query = '', $params = [])
	{
		try
		{
			$stmt = $this->executeStatement($query, $params);
			return $stmt->rowCount();
		}
		catch (\Exception $e)
		{
			throw new \Exception($e->getMessage());
		}
		return false;
	}

	public function getLastInsertID(): string
	{
		return $this->connection->lastInsertId();
	}

	public function listTables($includeViews = true)
	{
		$query = $this->queries[__FUNCTION__][$this->type];
		if ($query === false)
			return false;

		if ($includeViews === false && $this->type === 'mysql')
			$query .= ' WHERE Table_Type = \'BASE TABLE\'';
		elseif ($includeViews === false && $this->type === 'sqlsrv')
			$query .= ' WHERE TABLE_TYPE = \'BASE TABLE\'';

		try
		{
			$stmt = $this->executeStatement($query);
			return $stmt->fetchAll();
		}
		catch (\Exception $e)
		{
			throw new \Exception($e->getMessage());
		}
		return false;
	}

	public function getTableInformation(string $table)
	{
		$query = $this->queries[__FUNCTION__][$this->type];
		if ($query === false)
			return false;

		elseif ($this->type === 'sqlite')
			$query = 'PRAGMA table_info(?)';
		elseif ($this->type === 'sqlsrv')
			$query = 'SELECT * FROM information_schema.columns WHERE TABLE_NAME = ? order by ORDINAL_POSITION';
		try
		{
			$stmt = $this->executeStatement($query, array($table));
			return $stmt->fetchAll();
		}
		catch (\Exception $e)
		{
			throw new \Exception($e->getMessage());
		}
		return false;
	}

	public function getTableIndexes(string $table)
	{
		$query = $this->queries[__FUNCTION__][$this->type];
		if ($query === false)
			return false;

		try
		{
			$stmt = $this->executeStatement($query, array($table));
			return $stmt->fetchAll();
		}
		catch (\Exception $e)
		{
			throw new \Exception($e->getMessage());
		}
		return false;
	}

	public function getTableCreation(string $table)
	{
		$query = $this->queries[__FUNCTION__][$this->type];
		if ($query === false)
			return false;

		try
		{
			$stmt = $this->executeStatement($query, array($table));
			return $stmt->fetchAll();
		}
		catch (\Exception $e)
		{
			throw new \Exception($e->getMessage());
		}
		return false;
	}

	//$columns is expected to follow the structure below:
	// [
	// 	0 => array(
	// 		'name' => '',
	// 		'type' => '',
	// 		'index' => false,
	// 		'primary' => false,
	// 		'null' => false,
	// 		'default' => '', //Any type.
	// 		'foreign_key' => array()
	// 	),
	// ]
	public function createTable(string $tableName, array $columns)
	{
		$query = $this->queries[__FUNCTION__][$this->type];
		if ($query === false)
			return false;

		try
		{
			$stmt = $this->executeStatement($query, array($tableName,));
			return $stmt->fetchAll();
		}
		catch (\Exception $e)
		{
			throw new \Exception($e->getMessage());
		}

		return false;
	}
}

class Mailer
{
	public $senderEmail;

	private function __construct(string $senderEmail)
	{
		$this->senderEmail = $senderEmail;
	}

	public function sendMail(array|string $destination, string $subject, string $message, array|string $carbonCopy = '', array|string $blindCarbonCopy = '', array $additionalHeaders = array())
	{
		//Formatting destination.
		if (is_array($destination))
			$destination = implode(',', $destination);
		if (is_array($carbonCopy))
			$carbonCopy = implode(',', $carbonCopy);
		if (is_array($blindCarbonCopy))
			$blindCarbonCopy = implode(',', $blindCarbonCopy);


		$headers['From'] = $this->senderEmail;

		if ($carbonCopy !== '')
			$headers['CC'] = $carbonCopy;
		if ($blindCarbonCopy !== '')
			$headers['BCC'] = $blindCarbonCopy;

		$headers['MIME-Version'] = '1.0';
		$headers['Content-type'] = 'text/html';

		foreach ($additionalHeaders as $name => $header)
		{
			$headers[$name] = $header;
		}
		mail($destination, $subject, $message, $headers);
	}

	// private function checkEmailSentStatus()
	// {
	// }
}

class ScopeTimer
{
	public $name;
	public $startTime;
	public $showOnDescruct = false;

	public function __construct(string $name = 'Timer', bool $showOnDescruct = false)
	{
		$this->startTime = microtime(true);
		$this->name = $name;
		$this->showOnDescruct = $showOnDescruct;
	}

	public function __destruct()
	{
		if ($this->showOnDescruct)
			echo $this->name . ': ' . $this->stop() . 'ms';
	}

	public function stop()
	{
		return microtime(true) - $this->startTime;
	}

	//$timer = new ScopeTimer(__FILE__);
}
